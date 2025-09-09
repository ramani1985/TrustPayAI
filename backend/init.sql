-- TrustPay AI Database Schema
-- This file is used to initialize the PostgreSQL database in Docker

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS trustpay_ai;

-- Use the database
\c trustpay_ai;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL,
    source VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
    risk_score DECIMAL(3,2) NOT NULL CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    explanation TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions(email);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_score ON transactions(risk_score);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit trigger for transactions table
CREATE TRIGGER transactions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Create views for analytics
CREATE OR REPLACE VIEW transaction_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE status = 'success') as successful_transactions,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_transactions,
    AVG(risk_score) as avg_risk_score,
    SUM(amount) FILTER (WHERE status = 'success') as total_amount_processed,
    COUNT(*) FILTER (WHERE provider = 'stripe') as stripe_transactions,
    COUNT(*) FILTER (WHERE provider = 'paypal') as paypal_transactions
FROM transactions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create view for risk analysis
CREATE OR REPLACE VIEW risk_analysis AS
SELECT 
    CASE 
        WHEN risk_score < 0.3 THEN 'Low Risk'
        WHEN risk_score < 0.7 THEN 'Medium Risk'
        ELSE 'High Risk'
    END as risk_category,
    COUNT(*) as transaction_count,
    AVG(risk_score) as avg_risk_score,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_count,
    COUNT(*) FILTER (WHERE status = 'success') as success_count
FROM transactions
GROUP BY 
    CASE 
        WHEN risk_score < 0.3 THEN 'Low Risk'
        WHEN risk_score < 0.7 THEN 'Medium Risk'
        ELSE 'High Risk'
    END
ORDER BY avg_risk_score;

-- Insert sample data for development
INSERT INTO transactions (amount, currency, source, email, provider, status, risk_score, explanation) VALUES
(1000, 'USD', 'tok_visa_1234', 'customer@example.com', 'stripe', 'success', 0.2, 'Low risk transaction approved'),
(2500, 'USD', 'tok_mastercard_5678', 'user@example.com', 'paypal', 'success', 0.3, 'Medium-low risk transaction approved'),
(5000, 'USD', 'tok_test', 'test@example.ru', 'stripe', 'blocked', 0.8, 'High risk transaction blocked due to suspicious email domain'),
(10000, 'USD', 'tok_visa_9999', 'premium@example.com', 'stripe', 'blocked', 0.9, 'Very high risk transaction blocked due to large amount'),
(500, 'USD', 'tok_invalid', 'customer@example.com', 'paypal', 'failed', 0.1, 'Payment failed due to invalid source')
ON CONFLICT DO NOTHING;

-- Create user for application (optional, for production)
-- CREATE USER trustpay_app WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON transactions TO trustpay_app;
-- GRANT SELECT ON audit_logs TO trustpay_app;
-- GRANT SELECT ON transaction_stats TO trustpay_app;
-- GRANT SELECT ON risk_analysis TO trustpay_app;
