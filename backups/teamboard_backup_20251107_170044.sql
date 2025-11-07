--
-- PostgreSQL database dump
--

\restrict ACfQ4MaN8zcTqPtDrHyFgvnSU4dUkaVSmgBNiprLjbRldrSIf6cdDVf2QUdebfv

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_tasks_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_priority AS ENUM (
    'high',
    'medium',
    'low'
);


ALTER TYPE public.enum_tasks_priority OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tasks" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    completed boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Tasks" OWNER TO postgres;

--
-- Name: Tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tasks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tasks_id_seq" OWNER TO postgres;

--
-- Name: Tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tasks_id_seq" OWNED BY public."Tasks".id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    completed boolean DEFAULT false,
    "dueDate" timestamp with time zone,
    "userId" integer NOT NULL,
    priority public.enum_tasks_priority DEFAULT 'medium'::public.enum_tasks_priority NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: Tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tasks" ALTER COLUMN id SET DEFAULT nextval('public."Tasks_id_seq"'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: Tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tasks" (id, title, description, completed, "createdAt", "updatedAt") FROM stdin;
7	xsdsdsds	sdsdsdsds	f	2025-10-07 12:21:04.661+00	2025-10-07 18:50:31.908+00
11	aaa	ssssaaa	f	2025-10-07 13:09:31.896+00	2025-10-07 18:50:32.569+00
10	gg	gg	f	2025-10-07 12:38:21.174+00	2025-10-07 13:11:41.04+00
8	www	www	t	2025-10-07 12:37:59.883+00	2025-10-07 18:50:33.728+00
12	aaa	aaa	f	2025-10-07 15:15:04.141+00	2025-10-07 18:50:37.09+00
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, completed, "dueDate", "userId", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tasks_id_seq"', 14, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: Tasks Tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tasks"
    ADD CONSTRAINT "Tasks_pkey" PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users users_username_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key1 UNIQUE (username);


--
-- Name: users users_username_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key2 UNIQUE (username);


--
-- Name: users users_username_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key3 UNIQUE (username);


--
-- Name: users users_username_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key4 UNIQUE (username);


--
-- Name: users users_username_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key5 UNIQUE (username);


--
-- Name: users users_username_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key6 UNIQUE (username);


--
-- Name: users users_username_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key7 UNIQUE (username);


--
-- Name: tasks tasks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ACfQ4MaN8zcTqPtDrHyFgvnSU4dUkaVSmgBNiprLjbRldrSIf6cdDVf2QUdebfv

