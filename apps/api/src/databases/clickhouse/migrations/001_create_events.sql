-- Traytic events table
-- All analytics data flows through here
-- Partitioned by month, ordered by site_id + timestamp for fast queries

CREATE TABLE IF NOT EXISTS traytic.events
(
    -- Identity
    site_id      String,
    type         Enum8('pageview' = 1, 'custom' = 2, 'vital' = 3, 'error' = 4),

    -- Page
    url          String,
    path         String,
    hostname     String,

    -- Referrer & UTM
    referrer     String,
    referrer_source LowCardinality(String),
    utm_source   String,
    utm_medium   String,
    utm_campaign String,
    utm_content  String,
    utm_term     String,

    -- Geo (derived server-side from IP, never store raw IP)
    country      LowCardinality(FixedString(2)),
    region       LowCardinality(String),
    city         String,

    -- Device
    browser      LowCardinality(String),
    browser_version String,
    os           LowCardinality(String),
    os_version   String,
    device_type  Enum8('desktop' = 1, 'mobile' = 2, 'tablet' = 3, 'unknown' = 4),

    -- Session (privacy-safe, no raw PII)
    -- visitor_id = SHA256(site_id + ip + ua + date) — resets daily
    -- session_id = SHA256(site_id + ip + ua + session_start) — resets after 30min inactivity
    visitor_id   String,
    session_id   String,

    -- Engagement
    duration_ms  UInt32   DEFAULT 0,
    is_bounce    UInt8    DEFAULT 0,
    is_new       UInt8    DEFAULT 0,  -- new visitor today

    -- Web Vitals (populated when type = 'vital')
    vital_name   LowCardinality(String),
    vital_value  Float32  DEFAULT 0,
    vital_rating LowCardinality(String),  -- 'good' | 'needs-improvement' | 'poor'

    -- Custom events (populated when type = 'custom')
    event_name   String,
    meta         Map(String, String),

    -- Error tracking (populated when type = 'error')
    error_message String,
    error_stack   String,

    -- Timestamp
    ts           DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (site_id, ts)
TTL ts + INTERVAL 2 YEAR
SETTINGS index_granularity = 8192;
