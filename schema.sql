--
-- PostgreSQL database dump
--

\restrict oOCCoM0VzIYkQjcIZRBE47YJFAvodiMEiJBPwr5QZtYfmSIogRZq5WrCfNnHhnr

-- Dumped from database version 17.8 (a48d9ca)
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

--
-- Name: application_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.application_status AS ENUM (
    'Submitted',
    'Rejected',
    'Hired'
);


ALTER TYPE public.application_status OWNER TO neondb_owner;

--
-- Name: job_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.job_type AS ENUM (
    'Full-time',
    'Part-time',
    'Contract',
    'Internship'
);


ALTER TYPE public.job_type OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'jobseeker',
    'recruiter'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

--
-- Name: work_location; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.work_location AS ENUM (
    'On-site',
    'Remote',
    'Hybrid'
);


ALTER TYPE public.work_location OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    application_id integer NOT NULL,
    job_id integer NOT NULL,
    applicant_id integer NOT NULL,
    applicant_email character varying(255) NOT NULL,
    status public.application_status DEFAULT 'Submitted'::public.application_status NOT NULL,
    resume character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subscribed boolean
);


ALTER TABLE public.applications OWNER TO neondb_owner;

--
-- Name: applications_application_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.applications_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_application_id_seq OWNER TO neondb_owner;

--
-- Name: applications_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.applications_application_id_seq OWNED BY public.applications.application_id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    website character varying(255) NOT NULL,
    logo character varying(255) NOT NULL,
    logo_public_id character varying(255) NOT NULL,
    recruiter_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_company_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_company_id_seq OWNER TO neondb_owner;

--
-- Name: companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_company_id_seq OWNED BY public.companies.company_id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    job_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    salary numeric(10,2),
    location character varying(255),
    job_type public.job_type NOT NULL,
    openings numeric(3,1) NOT NULL,
    role character varying(255) NOT NULL,
    work_location public.work_location NOT NULL,
    company_id integer NOT NULL,
    posted_by_recruiter_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.jobs_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_job_id_seq OWNER TO neondb_owner;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.jobs_job_id_seq OWNED BY public.jobs.job_id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.skills (
    skill_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.skills OWNER TO neondb_owner;

--
-- Name: skills_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.skills_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_skill_id_seq OWNER TO neondb_owner;

--
-- Name: skills_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.skills_skill_id_seq OWNED BY public.skills.skill_id;


--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_skills (
    user_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.user_skills OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone_number character varying(20) NOT NULL,
    role public.user_role NOT NULL,
    bio text,
    resume character varying(255),
    resume_public_id character varying(255),
    profile_pic character varying(255),
    profile_pic_public_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subscription timestamp with time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO neondb_owner;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: applications application_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications ALTER COLUMN application_id SET DEFAULT nextval('public.applications_application_id_seq'::regclass);


--
-- Name: companies company_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN company_id SET DEFAULT nextval('public.companies_company_id_seq'::regclass);


--
-- Name: jobs job_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs ALTER COLUMN job_id SET DEFAULT nextval('public.jobs_job_id_seq'::regclass);


--
-- Name: skills skill_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills ALTER COLUMN skill_id SET DEFAULT nextval('public.skills_skill_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: applications applications_job_id_applicant_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_applicant_id_key UNIQUE (job_id, applicant_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (application_id);


--
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (company_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (skill_id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;


--
-- Name: jobs jobs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(company_id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(skill_id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict oOCCoM0VzIYkQjcIZRBE47YJFAvodiMEiJBPwr5QZtYfmSIogRZq5WrCfNnHhnr

