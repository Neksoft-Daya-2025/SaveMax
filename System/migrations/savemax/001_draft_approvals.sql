BEGIN;
CREATE TABLE IF NOT EXISTS savemax_draft_approvals (
  id uuid PRIMARY KEY,
  organization_id varchar(24) NOT NULL,
  candidate_id varchar(120) NOT NULL,
  requested_by varchar(12) NOT NULL,
  payload jsonb NOT NULL,
  payload_hash char(64) NOT NULL,
  property_id varchar(24) NOT NULL UNIQUE,
  state varchar(16) NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','APPROVED','REJECTED','EXECUTED')),
  approved_by varchar(24),
  decided_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS savemax_approvals_review ON savemax_draft_approvals(organization_id, state, created_at DESC);
CREATE TABLE IF NOT EXISTS savemax_approval_events (
  id bigserial PRIMARY KEY,
  approval_id uuid NOT NULL REFERENCES savemax_draft_approvals(id),
  organization_id varchar(24) NOT NULL,
  actor varchar(120) NOT NULL,
  action varchar(32) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
