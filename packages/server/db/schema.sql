\restrict dbmate

-- Dumped from database version 16.11
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    display_name text,
    bio text,
    role text DEFAULT 'Backer'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: campaign_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    target_date date NOT NULL,
    funding_pct integer NOT NULL,
    verification_criteria text NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: campaign_stretch_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_stretch_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    target_usd bigint NOT NULL,
    description text NOT NULL,
    deliverables text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: campaign_team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    bio text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: campaign_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    body text NOT NULL,
    posted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    description text NOT NULL,
    alignment_statement text NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    status text NOT NULL,
    hero_image_url text,
    min_funding_target_usd bigint NOT NULL,
    max_funding_cap_usd bigint NOT NULL,
    current_amount_usd bigint DEFAULT 0 NOT NULL,
    contributor_count integer DEFAULT 0 NOT NULL,
    deadline timestamp with time zone,
    launched_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    creator_id uuid,
    risk_disclosures text[] DEFAULT '{}'::text[] NOT NULL,
    cancellation_requested_at timestamp with time zone
);


--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    level text DEFAULT 'AUDIT'::text NOT NULL,
    correlation_id text,
    service text,
    message text,
    event_type text,
    actor_id uuid,
    actor_type text,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    outcome text,
    previous_state jsonb,
    new_state jsonb,
    rationale text
);


--
-- Name: campaign_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    event_type text NOT NULL,
    actor_id uuid,
    previous_state text,
    new_state text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: campaign_milestones campaign_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_milestones
    ADD CONSTRAINT campaign_milestones_pkey PRIMARY KEY (id);


--
-- Name: campaign_stretch_goals campaign_stretch_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_stretch_goals
    ADD CONSTRAINT campaign_stretch_goals_pkey PRIMARY KEY (id);


--
-- Name: campaign_team_members campaign_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_team_members
    ADD CONSTRAINT campaign_team_members_pkey PRIMARY KEY (id);


--
-- Name: campaign_updates campaign_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_updates
    ADD CONSTRAINT campaign_updates_pkey PRIMARY KEY (id);


--
-- Name: campaign_audit_events campaign_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_audit_events
    ADD CONSTRAINT campaign_audit_events_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_slug_key UNIQUE (slug);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: campaign_audit_events campaign_audit_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_audit_events
    ADD CONSTRAINT campaign_audit_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.accounts(id);


--
-- Name: campaign_audit_events campaign_audit_events_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_audit_events
    ADD CONSTRAINT campaign_audit_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.accounts(id);


--
-- Name: campaign_milestones campaign_milestones_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_milestones
    ADD CONSTRAINT campaign_milestones_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_stretch_goals campaign_stretch_goals_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_stretch_goals
    ADD CONSTRAINT campaign_stretch_goals_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_team_members campaign_team_members_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_team_members
    ADD CONSTRAINT campaign_team_members_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_updates campaign_updates_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_updates
    ADD CONSTRAINT campaign_updates_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260309000001'),
    ('20260309000002'),
    ('20260309000003'),
    ('20260309000004'),
    ('20260309000005'),
    ('20260309000006'),
    ('20260311000001'),
    ('20260311000002'),
    ('20260311000003'),
    ('20260311000004'),
    ('20260311000005'),
    ('20260311000009'),
    ('20260311000010'),
    ('20260311000011');
