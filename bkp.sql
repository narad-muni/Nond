CREATE TABLE public.adonis_schema (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    batch integer NOT NULL,
    migration_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.adonis_schema OWNER TO postgres;

--
-- Name: adonis_schema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adonis_schema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adonis_schema_id_seq OWNER TO postgres;

--
-- Name: adonis_schema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adonis_schema_id_seq OWNED BY public.adonis_schema.id;


--
-- Name: adonis_schema_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adonis_schema_versions (
    version integer NOT NULL
);


ALTER TABLE public.adonis_schema_versions OWNER TO postgres;

--
-- Name: archived_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archived_invoices (
    id character varying(255) NOT NULL,
    client character varying(255),
    "group" character varying(255),
    company character varying(255),
    particulars json,
    note character varying(255),
    paid boolean,
    gst boolean,
    remarks character varying(255),
    total real,
    tax real,
    date date
);


ALTER TABLE public.archived_invoices OWNER TO postgres;

--
-- Name: archived_register_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archived_register_templates (
    id integer NOT NULL,
    table_id integer,
    columns json
);


ALTER TABLE public.archived_register_templates OWNER TO postgres;

--
-- Name: archived_register_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.archived_register_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.archived_register_templates_id_seq OWNER TO postgres;

--
-- Name: archived_register_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.archived_register_templates_id_seq OWNED BY public.archived_register_templates.id;


--
-- Name: archived_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archived_tasks (
    id integer NOT NULL,
    assigned_to character varying(255),
    client character varying(255),
    status integer,
    priority integer,
    money json[],
    "time" json[],
    total_time character varying(255),
    total_money integer,
    billed boolean,
    invoice_id character varying(255),
    "group" character varying(255),
    title character varying(255),
    description character varying(255),
    service character varying(255),
    created date
);


ALTER TABLE public.archived_tasks OWNER TO postgres;

--
-- Name: automators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.automators (
    id integer NOT NULL,
    triggered_by integer,
    name character varying(255),
    status character varying(255),
    message character varying(255),
    data json,
    created_on timestamp with time zone
);


ALTER TABLE public.automators OWNER TO postgres;

--
-- Name: automators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.automators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.automators_id_seq OWNER TO postgres;

--
-- Name: automators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.automators_id_seq OWNED BY public.automators.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    gst json,
    address character varying(255),
    pan json,
    signature json,
    logo json,
    group_id integer,
    deleted boolean DEFAULT false,
    adhaar_no json,
    din_no json,
    passport json,
    tan_no json,
    udhyam_no json,
    food_license json,
    cin json,
    llpin json,
    rof_registration_no json,
    iec json,
    shop_and_establishment_no character varying(255),
    expiry_date date,
    dob date,
    name_of_director character varying(255),
    mobile_no character varying(255),
    gst_username character varying(255),
    gst_password character varying(255)
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255),
    invoice_prefix character varying(255),
    gst json,
    upi character varying(255),
    email character varying(255),
    address character varying(255),
    pan json,
    signature json,
    logo json,
    invoice_counter integer DEFAULT 0,
    account_holder_name character varying(255),
    bank_name character varying(255),
    account_number character varying(255),
    ifsc_branch character varying(255),
    smtp_host character varying(255),
    smtp_port character varying(255),
    smtp_email character varying(255),
    smtp_password character varying(255),
    deleted boolean DEFAULT false
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    username character varying(255),
    password character varying(255),
    role_id integer,
    is_admin boolean,
    deleted boolean DEFAULT false
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id character varying(255),
    client_id integer,
    company_id integer,
    particulars json,
    paid boolean,
    gst boolean,
    remarks character varying(255),
    note character varying(255),
    total real,
    tax real,
    date date
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    client character varying(255),
    status character varying(255),
    assigned_to integer,
    description character varying(255),
    started date
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO postgres;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: master_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_templates (
    id integer NOT NULL,
    table_name character varying(255),
    column_name character varying(255),
    display_name character varying(255),
    column_type character varying(255),
    "order" integer,
    service_id integer,
    column_info json,
    is_master boolean,
    is_rollover boolean
);


ALTER TABLE public.master_templates OWNER TO postgres;

--
-- Name: master_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_templates_id_seq OWNER TO postgres;

--
-- Name: master_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_templates_id_seq OWNED BY public.master_templates.id;


--
-- Name: register__Advance_Tax2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__Advance_Tax2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    q1 character varying(255),
    q2 character varying(255),
    q3 character varying(255),
    q4 character varying(255),
    total character varying(255),
    frequency character varying
);


ALTER TABLE public."register__Advance_Tax2023_24" OWNER TO postgres;

--
-- Name: register__Advance_Tax2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__Advance_Tax2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__Advance_Tax2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__Audit2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__Audit2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    fy character varying(255),
    ay character varying(255),
    audit_type character varying(255),
    audit_date date,
    udin character varying(255),
    uploading_date date,
    acceptance_date date,
    frequency character varying
);


ALTER TABLE public."register__Audit2023_24" OWNER TO postgres;

--
-- Name: register__Audit2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__Audit2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__Audit2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__Courier_; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__Courier_" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    document character varying(255),
    courier character varying(255),
    tracking_no character varying(255),
    amount character varying(255),
    frequency character varying
);


ALTER TABLE public."register__Courier_" OWNER TO postgres;

--
-- Name: register__Courier__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__Courier_" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__Courier__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__DIN_KYC2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__DIN_KYC2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    due_date date,
    date_of_filing date,
    srn_no character varying(255),
    frequency character varying
);


ALTER TABLE public."register__DIN_KYC2023_24" OWNER TO postgres;

--
-- Name: register__DIN_KYC2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__DIN_KYC2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__DIN_KYC2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__DSC_List2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__DSC_List2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    appl_no character varying(255),
    appl_date date,
    appl_status character varying(255),
    class character varying(255),
    validity character varying(255),
    individual_organisation character varying(255),
    agent character varying(255),
    frequency character varying
);


ALTER TABLE public."register__DSC_List2023_24" OWNER TO postgres;

--
-- Name: register__DSC_List2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__DSC_List2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__DSC_List2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__GST_12023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__GST_12023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    filling_date date,
    ar_no character varying(255),
    frequency character varying
);


ALTER TABLE public."register__GST_12023_24" OWNER TO postgres;

--
-- Name: register__GST_1Feb_1__2024___Apr_1__2024_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__GST_12023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__GST_1Feb_1__2024___Apr_1__2024_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1
);


--
-- Name: register__GST_3B2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__GST_3B2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    periodicity character varying(255),
    filling_datr date,
    ar_no character varying(255),
    frequency character varying
);


ALTER TABLE public."register__GST_3B2023_24" OWNER TO postgres;

--
-- Name: register__GST_3B2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__GST_3B2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__GST_3B2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__GST_Annual_Return2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__GST_Annual_Return2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    gst9_date date,
    gst9_arn character varying(255),
    gst_9_c_date date,
    gst_9_c_arn character varying(255),
    frequency character varying
);


ALTER TABLE public."register__GST_Annual_Return2023_24" OWNER TO postgres;

--
-- Name: register__GST_Annual_Return2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__GST_Annual_Return2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__GST_Annual_Return2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__Income_Tax2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__Income_Tax2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    dor date,
    dof date,
    acknowledgement_no character varying(255),
    demand character varying(255),
    refund character varying(255),
    e_verify character varying(255),
    frequency character varying
);


ALTER TABLE public."register__Income_Tax2023_24" OWNER TO postgres;

--
-- Name: register__Income_Tax2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__Income_Tax2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__Income_Tax2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__Password_Register_; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__Password_Register_" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    frequency character varying
);


ALTER TABLE public."register__Password_Register_" OWNER TO postgres;

--
-- Name: register__Password_Register__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__Password_Register_" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__Password_Register__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__ROC_Filling2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__ROC_Filling2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    reg_no character varying(255),
    form_no character varying(255),
    due date,
    date_of_filling date,
    srn_no character varying(255),
    frequency character varying
);


ALTER TABLE public."register__ROC_Filling2023_24" OWNER TO postgres;

--
-- Name: register__ROC_Filling2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__ROC_Filling2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__ROC_Filling2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__TDS_Return2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__TDS_Return2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    form_no character varying(255),
    quarter character varying(255),
    filling_date date,
    token_no character varying(255),
    filling_fees character varying(255),
    frequency character varying
);


ALTER TABLE public."register__TDS_Return2023_24" OWNER TO postgres;

--
-- Name: register__TDS_Return2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__TDS_Return2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__TDS_Return2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register__TIN_FC2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."register__TIN_FC2023_24" (
    id integer NOT NULL,
    client_id integer,
    entry_on date DEFAULT CURRENT_DATE,
    form_no character varying(255),
    quarter character varying(255),
    filling_date date,
    token_no character varying(255),
    frequency character varying
);


ALTER TABLE public."register__TIN_FC2023_24" OWNER TO postgres;

--
-- Name: register__TIN_FC2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."register__TIN_FC2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."register__TIN_FC2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: register_masters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.register_masters (
    id integer NOT NULL,
    name character varying(255),
    version character varying(255),
    service_id integer,
    active boolean
);


ALTER TABLE public.register_masters OWNER TO postgres;

--
-- Name: register_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.register_masters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.register_masters_id_seq OWNER TO postgres;

--
-- Name: register_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.register_masters_id_seq OWNED BY public.register_masters.id;


--
-- Name: register_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.register_templates (
    id integer NOT NULL,
    table_id integer,
    column_name character varying(255),
    display_name character varying(255),
    column_type character varying(255),
    column_info json,
    "order" integer,
    client_column_id integer,
    master boolean,
    rollover boolean
);


ALTER TABLE public.register_templates OWNER TO postgres;

--
-- Name: register_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.register_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.register_templates_id_seq OWNER TO postgres;

--
-- Name: register_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.register_templates_id_seq OWNED BY public.register_templates.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255),
    read json,
    "create" json,
    update json,
    remove json,
    destroy json
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: rollover__register__Advance_Tax2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__Advance_Tax2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__Advance_Tax2023_24" OWNER TO postgres;

--
-- Name: rollover__register__Advance_Tax2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__Advance_Tax2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__Advance_Tax2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__Audit2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__Audit2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__Audit2023_24" OWNER TO postgres;

--
-- Name: rollover__register__Audit2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__Audit2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__Audit2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__Courier_; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__Courier_" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__Courier_" OWNER TO postgres;

--
-- Name: rollover__register__Courier__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__Courier_" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__Courier__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__DIN_KYC2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__DIN_KYC2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__DIN_KYC2023_24" OWNER TO postgres;

--
-- Name: rollover__register__DIN_KYC2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__DIN_KYC2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__DIN_KYC2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__DSC_List2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__DSC_List2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__DSC_List2023_24" OWNER TO postgres;

--
-- Name: rollover__register__DSC_List2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__DSC_List2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__DSC_List2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__GST_12023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__GST_12023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__GST_12023_24" OWNER TO postgres;

--
-- Name: rollover__register__GST_12023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__GST_12023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__GST_12023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__GST_3B2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__GST_3B2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__GST_3B2023_24" OWNER TO postgres;

--
-- Name: rollover__register__GST_3B2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__GST_3B2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__GST_3B2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__GST_Annual_Return2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__GST_Annual_Return2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__GST_Annual_Return2023_24" OWNER TO postgres;

--
-- Name: rollover__register__GST_Annual_Return2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__GST_Annual_Return2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__GST_Annual_Return2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__Income_Tax2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__Income_Tax2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__Income_Tax2023_24" OWNER TO postgres;

--
-- Name: rollover__register__Income_Tax2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__Income_Tax2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__Income_Tax2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__Password_Register_; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__Password_Register_" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__Password_Register_" OWNER TO postgres;

--
-- Name: rollover__register__Password_Register__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__Password_Register_" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__Password_Register__id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__ROC_Filling2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__ROC_Filling2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__ROC_Filling2023_24" OWNER TO postgres;

--
-- Name: rollover__register__ROC_Filling2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__ROC_Filling2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__ROC_Filling2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__TDS_Return2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__TDS_Return2023_24" (
    id integer NOT NULL,
    client_id integer,
    form_no character varying(255),
    quarter character varying(255)
);


ALTER TABLE public."rollover__register__TDS_Return2023_24" OWNER TO postgres;

--
-- Name: rollover__register__TDS_Return2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__TDS_Return2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__TDS_Return2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rollover__register__TIN_FC2023_24; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rollover__register__TIN_FC2023_24" (
    id integer NOT NULL,
    client_id integer
);


ALTER TABLE public."rollover__register__TIN_FC2023_24" OWNER TO postgres;

--
-- Name: rollover__register__TIN_FC2023_24_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."rollover__register__TIN_FC2023_24" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."rollover__register__TIN_FC2023_24_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schedulers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedulers (
    id integer NOT NULL,
    type integer,
    next date,
    end_date date,
    frequency character varying(255),
    data json,
    client_id integer,
    count integer,
    service_id integer,
    register_id integer
);


ALTER TABLE public.schedulers OWNER TO postgres;

--
-- Name: schedulers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedulers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedulers_id_seq OWNER TO postgres;

--
-- Name: schedulers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedulers_id_seq OWNED BY public.schedulers.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(255),
    hsn integer,
    gst integer,
    template_id integer
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: task_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_templates (
    id integer NOT NULL,
    name character varying(255),
    title character varying(255),
    description character varying(255),
    service_id integer,
    status integer,
    priority integer
);


ALTER TABLE public.task_templates OWNER TO postgres;

--
-- Name: task_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_templates_id_seq OWNER TO postgres;

--
-- Name: task_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_templates_id_seq OWNED BY public.task_templates.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    assigned_to integer,
    client_id integer,
    title character varying(255),
    description character varying(255),
    service_id integer,
    status integer,
    priority integer,
    invoice_id character varying(255),
    money json[],
    "time" json[],
    total_money integer,
    total_time character varying(255),
    billed boolean DEFAULT false,
    due_date date,
    created date
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


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name character varying(255),
    columns json,
    client_columns json,
    cost integer,
    per character varying(255)
);


ALTER TABLE public.templates OWNER TO postgres;

--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.templates_id_seq OWNER TO postgres;

--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: adonis_schema id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adonis_schema ALTER COLUMN id SET DEFAULT nextval('public.adonis_schema_id_seq'::regclass);


--
-- Name: archived_register_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archived_register_templates ALTER COLUMN id SET DEFAULT nextval('public.archived_register_templates_id_seq'::regclass);


--
-- Name: automators id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automators ALTER COLUMN id SET DEFAULT nextval('public.automators_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: master_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_templates ALTER COLUMN id SET DEFAULT nextval('public.master_templates_id_seq'::regclass);


--
-- Name: register_masters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register_masters ALTER COLUMN id SET DEFAULT nextval('public.register_masters_id_seq'::regclass);


--
-- Name: register_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register_templates ALTER COLUMN id SET DEFAULT nextval('public.register_templates_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: schedulers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedulers ALTER COLUMN id SET DEFAULT nextval('public.schedulers_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: task_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_templates ALTER COLUMN id SET DEFAULT nextval('public.task_templates_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);

SELECT pg_catalog.setval('public.adonis_schema_id_seq', 18, true);


--
-- Name: archived_register_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archived_register_templates_id_seq', 3, true);


--
-- Name: automators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.automators_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 4, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leads_id_seq', 1, false);


--
-- Name: master_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.master_templates_id_seq', 17, true);


--
-- Name: register__Advance_Tax2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__Advance_Tax2023_24_id_seq"', 1, false);


--
-- Name: register__Audit2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__Audit2023_24_id_seq"', 1, false);


--
-- Name: register__Courier__id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__Courier__id_seq"', 1, true);


--
-- Name: register__DIN_KYC2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__DIN_KYC2023_24_id_seq"', 2, true);


--
-- Name: register__DSC_List2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__DSC_List2023_24_id_seq"', 1, false);


--
-- Name: register__GST_1Feb_1__2024___Apr_1__2024_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__GST_1Feb_1__2024___Apr_1__2024_id_seq"', 11, true);


--
-- Name: register__GST_3B2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__GST_3B2023_24_id_seq"', 4, true);


--
-- Name: register__GST_Annual_Return2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__GST_Annual_Return2023_24_id_seq"', 1, false);


--
-- Name: register__Income_Tax2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__Income_Tax2023_24_id_seq"', 1, false);


--
-- Name: register__Password_Register__id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__Password_Register__id_seq"', 2, true);


--
-- Name: register__ROC_Filling2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__ROC_Filling2023_24_id_seq"', 1, false);


--
-- Name: register__TDS_Return2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__TDS_Return2023_24_id_seq"', 1, false);


--
-- Name: register__TIN_FC2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."register__TIN_FC2023_24_id_seq"', 1, false);


--
-- Name: register_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.register_masters_id_seq', 20, true);


--
-- Name: register_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.register_templates_id_seq', 99, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: rollover__register__Advance_Tax2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__Advance_Tax2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__Audit2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__Audit2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__Courier__id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__Courier__id_seq"', 1, false);


--
-- Name: rollover__register__DIN_KYC2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__DIN_KYC2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__DSC_List2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__DSC_List2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__GST_12023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__GST_12023_24_id_seq"', 1, false);


--
-- Name: rollover__register__GST_3B2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__GST_3B2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__GST_Annual_Return2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__GST_Annual_Return2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__Income_Tax2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__Income_Tax2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__Password_Register__id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__Password_Register__id_seq"', 1, false);


--
-- Name: rollover__register__ROC_Filling2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__ROC_Filling2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__TDS_Return2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__TDS_Return2023_24_id_seq"', 1, false);


--
-- Name: rollover__register__TIN_FC2023_24_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."rollover__register__TIN_FC2023_24_id_seq"', 1, false);


--
-- Name: schedulers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedulers_id_seq', 24, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 13, true);


--
-- Name: task_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_templates_id_seq', 2, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 22, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.templates_id_seq', 1, false);


--
-- Name: adonis_schema adonis_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adonis_schema
    ADD CONSTRAINT adonis_schema_pkey PRIMARY KEY (id);


--
-- Name: archived_invoices archived_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archived_invoices
    ADD CONSTRAINT archived_invoices_pkey PRIMARY KEY (id);


--
-- Name: archived_register_templates archived_register_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archived_register_templates
    ADD CONSTRAINT archived_register_templates_pkey PRIMARY KEY (id);


--
-- Name: archived_tasks archived_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archived_tasks
    ADD CONSTRAINT archived_tasks_pkey PRIMARY KEY (id);


--
-- Name: automators automators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automators
    ADD CONSTRAINT automators_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: master_templates master_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_templates
    ADD CONSTRAINT master_templates_pkey PRIMARY KEY (id);


--
-- Name: register__Advance_Tax2023_24 register__Advance_Tax2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__Advance_Tax2023_24"
    ADD CONSTRAINT "register__Advance_Tax2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__Audit2023_24 register__Audit2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__Audit2023_24"
    ADD CONSTRAINT "register__Audit2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__Courier_ register__Courier__pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__Courier_"
    ADD CONSTRAINT "register__Courier__pkey" PRIMARY KEY (id);


--
-- Name: register__DIN_KYC2023_24 register__DIN_KYC2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__DIN_KYC2023_24"
    ADD CONSTRAINT "register__DIN_KYC2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__DSC_List2023_24 register__DSC_List2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__DSC_List2023_24"
    ADD CONSTRAINT "register__DSC_List2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__GST_12023_24 register__GST_1Feb_1__2024___Apr_1__2024_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__GST_12023_24"
    ADD CONSTRAINT "register__GST_1Feb_1__2024___Apr_1__2024_pkey" PRIMARY KEY (id);


--
-- Name: register__GST_3B2023_24 register__GST_3B2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__GST_3B2023_24"
    ADD CONSTRAINT "register__GST_3B2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__GST_Annual_Return2023_24 register__GST_Annual_Return2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__GST_Annual_Return2023_24"
    ADD CONSTRAINT "register__GST_Annual_Return2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__Income_Tax2023_24 register__Income_Tax2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__Income_Tax2023_24"
    ADD CONSTRAINT "register__Income_Tax2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__Password_Register_ register__Password_Register__pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__Password_Register_"
    ADD CONSTRAINT "register__Password_Register__pkey" PRIMARY KEY (id);


--
-- Name: register__ROC_Filling2023_24 register__ROC_Filling2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__ROC_Filling2023_24"
    ADD CONSTRAINT "register__ROC_Filling2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__TDS_Return2023_24 register__TDS_Return2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__TDS_Return2023_24"
    ADD CONSTRAINT "register__TDS_Return2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register__TIN_FC2023_24 register__TIN_FC2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."register__TIN_FC2023_24"
    ADD CONSTRAINT "register__TIN_FC2023_24_pkey" PRIMARY KEY (id);


--
-- Name: register_masters register_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register_masters
    ADD CONSTRAINT register_masters_pkey PRIMARY KEY (id);


--
-- Name: register_templates register_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register_templates
    ADD CONSTRAINT register_templates_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: rollover__register__Advance_Tax2023_24 rollover__register__Advance_Tax2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__Advance_Tax2023_24"
    ADD CONSTRAINT "rollover__register__Advance_Tax2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__Audit2023_24 rollover__register__Audit2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__Audit2023_24"
    ADD CONSTRAINT "rollover__register__Audit2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__Courier_ rollover__register__Courier__pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__Courier_"
    ADD CONSTRAINT "rollover__register__Courier__pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__DIN_KYC2023_24 rollover__register__DIN_KYC2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__DIN_KYC2023_24"
    ADD CONSTRAINT "rollover__register__DIN_KYC2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__DSC_List2023_24 rollover__register__DSC_List2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__DSC_List2023_24"
    ADD CONSTRAINT "rollover__register__DSC_List2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__GST_12023_24 rollover__register__GST_12023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__GST_12023_24"
    ADD CONSTRAINT "rollover__register__GST_12023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__GST_3B2023_24 rollover__register__GST_3B2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__GST_3B2023_24"
    ADD CONSTRAINT "rollover__register__GST_3B2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__GST_Annual_Return2023_24 rollover__register__GST_Annual_Return2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__GST_Annual_Return2023_24"
    ADD CONSTRAINT "rollover__register__GST_Annual_Return2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__Income_Tax2023_24 rollover__register__Income_Tax2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__Income_Tax2023_24"
    ADD CONSTRAINT "rollover__register__Income_Tax2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__Password_Register_ rollover__register__Password_Register__pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__Password_Register_"
    ADD CONSTRAINT "rollover__register__Password_Register__pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__ROC_Filling2023_24 rollover__register__ROC_Filling2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__ROC_Filling2023_24"
    ADD CONSTRAINT "rollover__register__ROC_Filling2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__TDS_Return2023_24 rollover__register__TDS_Return2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__TDS_Return2023_24"
    ADD CONSTRAINT "rollover__register__TDS_Return2023_24_pkey" PRIMARY KEY (id);


--
-- Name: rollover__register__TIN_FC2023_24 rollover__register__TIN_FC2023_24_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rollover__register__TIN_FC2023_24"
    ADD CONSTRAINT "rollover__register__TIN_FC2023_24_pkey" PRIMARY KEY (id);


--
-- Name: schedulers schedulers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedulers
    ADD CONSTRAINT schedulers_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: task_templates task_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_templates
    ADD CONSTRAINT task_templates_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);

COPY public.services (id, name, hsn, gst, template_id) FROM stdin;
2	GST 3B	123456	18	-1
3	GST Annual	123456	18	-1
4	Income Tax	123456	18	-1
5	TDS	123456	18	-1
6	One Time	123456	18	-1
8	DSC	123456	18	-1
9	TIN FC	123456	18	-1
10	Audit	123456	18	-1
11	Advanced Tax	123456	18	-1
12	ROC	123456	18	-1
1	GST 1	123456	18	1
-1	Others	0	0	-1
\.

COPY public.schedulers (id, type, next, end_date, frequency, data, client_id, count, service_id, register_id) FROM stdin;
-1	4	2024-04-01	\N	1 year	{"info":"every financial year"}	\N	\N	\N	\N
13	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	13
3	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	17
4	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	4
5	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	5
6	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	6
7	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	7
9	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	9
14	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	14
11	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	11
10	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	10
8	1	2024-04-01	\N	1 year	{"rotation_strategy":"archive"}	\N	\N	\N	8
12	-1	\N	\N	\N	{"rotation_strategy":"archive"}	\N	\N	\N	12
15	-1	\N	\N	\N	{"rotation_strategy":"archive"}	\N	\N	\N	18
-3	2	2024-02-15	\N	1 week	{"info":"delete data"}	\N	\N	\N	\N
-2	3	2024-02-15	\N	1 week	{"info":"archive data"}	\N	\N	\N	\N
\.

COPY public.task_templates (id, name, title, description, service_id, status, priority) FROM stdin;
-1	Default			-1	0	1
1	GST 1	File GST 1	File GST for this client	1	0	1
2	One Time Template	Client Onboarding	Please add onboarding details for client	6	0	1
\.

COPY public.roles (id, name, read, "create", update, remove, destroy) FROM stdin;
-2	viewer	{"task":true}	{}	{}	{}	{}
-1	admin	{"client":true,"report":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true,"automator":true}	{"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true}	{"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true}	{"client":true,"company":true,"employee":true}	{"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true,"automator":true}
\.

COPY public.register_templates (id, table_id, column_name, display_name, column_type, column_info, "order", client_column_id, master, rollover) FROM stdin;
-3	5	entry_on	Entry On	Date	{}	1	\N	t	f
-9	11	entry_on	Entry On	Date	{}	1	\N	t	f
-11	13	entry_on	Entry On	Date	{}	1	\N	t	f
27	6	dof	DOF	Date	{"options":[""]}	6	\N	t	f
28	6	acknowledgement_no	Acknowledgement No	Text	{"options":[""]}	7	\N	t	f
29	6	demand	Demand	Text	{"options":[""]}	8	\N	t	f
7	17	name	Name	Text	{"options":[""]}	1	-1	t	f
8	17	gst	GST	File	{"options":[""]}	2	-4	t	\N
9	17	filling_date	Filling Date	Date	{"options":[""]}	3	\N	t	f
10	17	ar_no	AR No.	Text	{"options":[""]}	4	\N	t	f
-1	17	entry_on	Entry On	Date	{}	5	\N	t	f
11	4	name	Name	Text	{"options":[""]}	1	-1	t	\N
12	4	gst	GST	File	{"options":[""]}	2	-4	t	\N
30	6	refund	Refund	Text	{"options":[""]}	9	\N	t	f
14	4	filling_datr	Filling Datr	Date	{"options":[""]}	4	\N	t	f
15	4	ar_no	AR No.	Text	{"options":[""]}	5	\N	t	f
-2	4	entry_on	Entry On	Date	{}	6	\N	t	f
13	4	periodicity	Periodicity	Text	{"options":[""]}	3	\N	t	f
16	5	name	Name	Text	{"options":[""]}	2	-1	t	\N
17	5	gst	GST	File	{"options":[""]}	3	-4	t	\N
18	5	gst9_date	GST9 Date	Date	{"options":[""]}	4	\N	t	f
19	5	gst9_arn	GST9 ARN	Text	{"options":[""]}	5	\N	t	f
20	5	gst_9_c_date	GST 9C Date	Date	{"options":[""]}	6	\N	t	f
21	5	gst_9_c_arn	GST 9C ARN	Text	{"options":[""]}	7	\N	t	f
31	6	e_verify	E-Verify	Text	{"options":[""]}	10	\N	t	f
32	7	name	Name	Text	{"options":[""]}	1	-1	t	\N
34	7	form_no	Form No	Text	{"options":[""]}	3	\N	t	t
35	7	quarter	Quarter	Text	{"options":[""]}	4	\N	t	t
36	7	filling_date	Filling Date	Date	{"options":[""]}	5	\N	t	f
37	7	token_no	Token No	Text	{"options":[""]}	6	\N	t	f
38	7	filling_fees	Filling Fees	Text	{"options":[""]}	7	\N	t	f
-5	7	entry_on	Entry On	Date	{}	8	\N	t	f
22	6	name	Name	Text	{"options":[""]}	1	-1	t	\N
23	6	group	Group	Dropdown	{"options":[""]}	2	-3	t	\N
24	6	dor	DOR	Date	{"options":[""]}	3	\N	t	f
25	6	pan	Pan	File	{"options":[""]}	4	-5	t	\N
26	6	dob	DOB	Date	{"options":[""]}	5	13	t	\N
-4	6	entry_on	Entry On	Date	{}	11	\N	t	f
39	8	name	Name	Text	{"options":[""]}	1	-1	t	\N
40	8	reg_no	Reg No	Text	{"options":[""]}	2	\N	t	f
41	8	form_no	Form No	Text	{"options":[""]}	3	\N	t	f
42	8	due	Due	Date	{"options":[""]}	4	\N	t	f
43	8	date_of_filling	Date Of Filling	Date	{"options":[""]}	5	\N	t	f
44	8	srn_no	SRN No	Text	{"options":[""]}	6	\N	t	f
-6	8	entry_on	Entry On	Date	{}	7	\N	t	f
48	10	q2	Q2	Text	{"options":[""]}	4	\N	t	f
49	10	q3	Q3	Text	{"options":[""]}	5	\N	t	f
50	10	q4	Q4	Text	{"options":[""]}	6	\N	t	f
-10	12	entry_on	Entry On	Date	{}	6	\N	t	f
63	11	name	Name	Text	{"options":[""]}	2	-1	t	\N
64	11	pan	Pan	File	{"options":[""]}	3	-5	t	\N
65	11	fy	FY	Text	{"options":[""]}	4	\N	t	f
45	10	name	Name	Text	{"options":[""]}	1	-1	t	f
46	10	pan	Pan	File	{"options":[""]}	2	-5	t	\N
47	10	q1	Q1	Text	{"options":[""]}	3	\N	t	f
51	10	total	Total	Text	{"options":[""]}	7	\N	t	f
-8	10	entry_on	Entry On	Date	{}	8	\N	t	f
57	13	name	Name	Text	{"options":[""]}	2	-1	t	\N
59	13	form_no	Form No	Text	{"options":[""]}	4	\N	t	f
60	13	quarter	Quarter	Text	{"options":[""]}	5	\N	t	f
61	13	filling_date	Filling Date	Date	{"options":[""]}	6	\N	t	f
62	13	token_no	Token No	Text	{"options":[""]}	7	\N	t	f
52	12	name	Name	Text	{"options":[""]}	1	-1	t	\N
53	12	document	Document	Text	{"options":[""]}	2	\N	t	f
54	12	courier	Courier	Text	{"options":[""]}	3	\N	t	f
55	12	tracking_no	Tracking No	Text	{"options":[""]}	4	\N	t	f
56	12	amount	Amount	Text	{"options":[""]}	5	\N	t	f
66	11	ay	AY	Text	{"options":[""]}	5	\N	t	f
67	11	audit_type	Audit Type	Dropdown	{"options":["Statutory Audit","Income Tax Audit","GST Audit"]}	6	\N	t	f
68	11	audit_date	Audit Date	Date	{"options":[""]}	7	\N	t	f
69	11	udin	UDIN	Text	{"options":[""]}	8	\N	t	f
70	11	uploading_date	Uploading Date	Date	{"options":[""]}	9	\N	t	f
71	11	acceptance_date	Acceptance Date	Date	{"options":[""]}	10	\N	t	f
72	9	name	Name	Text	{"options":[""]}	1	-1	t	\N
73	9	name_of_director	Name of Director	Text	{"options":[""]}	2	14	t	\N
74	9	din_no	DIN No	File	{"options":[""]}	3	2	t	f
75	9	due_date	Due Date	Date	{"options":[""]}	4	\N	t	f
76	9	date_of_filing	Date of Filing	Date	{"options":[""]}	5	\N	t	f
77	9	srn_no	SRN No	Text	{"options":[""]}	6	\N	t	f
-7	9	entry_on	Entry On	Date	{}	7	\N	t	f
79	14	appl_no	Appl No	Text	{"options":[""]}	2	\N	t	f
-12	14	entry_on	Entry On	Date	{}	13	\N	t	f
33	7	tan_no	Tan No	File	{"options":[""]}	2	4	t	\N
78	14	name	Name	Text	{"options":[""]}	1	-1	t	\N
80	14	appl_date	Appl Date	Date	{"options":[""]}	3	\N	t	f
81	14	appl_status	Appl Status	Dropdown	{"options":["Approved","Downloaded","Rejected","Video Pending","E-Sign Pending","E-Mail Verification Pending"]}	4	\N	t	f
82	14	dob	DOB	Date	{"options":[""]}	5	13	t	\N
83	14	pan	Pan	File	{"options":[""]}	6	-5	t	\N
84	14	class	Class	Dropdown	{"options":["Class 3","DGFT"]}	7	\N	t	f
85	14	validity	Validity	Dropdown	{"options":["2 Years","3 Years"]}	8	\N	t	f
86	14	individual_organisation	Individual/ Organisation	Dropdown	{"options":["Organization","Individual"]}	9	\N	t	f
88	14	mobile_no	Mobile No	Text	{"options":[""]}	10	15	t	\N
87	14	email	Email	Text	{"options":[""]}	11	-2	t	\N
89	14	agent	Agent	Text	{"options":[""]}	12	\N	t	f
58	13	tan_no	Tan No	File	{"options":[""]}	3	4	t	f
90	18	name	Name	Text	{"options":[""]}	1	-1	t	\N
91	18	group	Group	Dropdown	{"options":[""]}	2	-3	t	\N
92	18	gst_username	GST Username	Text	{"options":[""]}	3	16	t	\N
93	18	gst_password	GST Password	Text	{"options":[""]}	4	17	t	\N
-13	18	entry_on	Entry On	Date	{}	5	\N	t	f
94	17	gst_username	GST Username	Text	{"options":[""]}	6	16	t	\N
95	17	gst_password	GST Password	Text	{"options":[""]}	7	17	t	\N
96	4	gst_username	GST Username	Text	{"options":[""]}	7	16	t	\N
97	4	gst_password	GST Password	Text	{"options":[""]}	8	17	t	\N
98	5	gst_username	GST Username	Text	{"options":[""]}	8	16	t	\N
99	5	gst_password	GST Password	Text	{"options":[""]}	9	17	t	\N
-14	17	frequency	Frequency	Text	{}	5	\N	t	f
-15	4	frequency	Frequency	Text	{}	6	\N	t	f
-16	5	frequency	Frequency	Text	{}	1	\N	t	f
-17	6	frequency	Frequency	Text	{}	11	\N	t	f
-18	7	frequency	Frequency	Text	{}	8	\N	t	f
-19	8	frequency	Frequency	Text	{}	7	\N	t	f
-20	9	frequency	Frequency	Text	{}	7	\N	t	f
-21	10	frequency	Frequency	Text	{}	8	\N	t	f
-22	11	frequency	Frequency	Text	{}	1	\N	t	f
-23	12	frequency	Frequency	Text	{}	6	\N	t	f
-24	13	frequency	Frequency	Text	{}	1	\N	t	f
-25	14	frequency	Frequency	Text	{}	13	\N	t	f
-26	18	frequency	Frequency	Text	{}	5	\N	t	f
\.

COPY public.register_masters (id, name, version, service_id, active) FROM stdin;
12	Courier	-	-1	t
13	TIN FC	2023-24	-1	t
17	GST 1	2023-24	1	t
4	GST 3B	2023-24	2	t
5	GST Annual Return	2023-24	3	t
6	Income Tax	2023-24	4	t
7	TDS Return	2023-24	5	t
9	DIN KYC	2023-24	6	t
14	DSC List	2023-24	8	t
11	Audit	2023-24	10	t
10	Advance Tax	2023-24	11	t
8	ROC Filling	2023-24	12	t
18	Password Register	-	6	t
\.

COPY public.master_templates (id, table_name, column_name, display_name, column_type, "order", service_id, column_info, is_master, is_rollover) FROM stdin;
-1	clients	name	Name	Text	1	\N	{}	t	\N
-2	clients	email	Email	Text	1	\N	{}	t	\N
-3	clients	group	Group	Dropdown	1	\N	{"options":[]}	t	\N
-4	clients	gst	GST	File	1	\N	{}	t	\N
-5	clients	pan	Pan	File	1	\N	{}	f	\N
-6	clients	address	Address	Text	1	\N	{}	f	\N
-7	clients	signature	Signature	File	1	\N	{}	f	\N
-8	clients	logo	Logo	File	1	\N	{}	f	\N
-9	companies	name	Name	Text	1	\N	{}	t	\N
-10	companies	invoice_prefix	Invoice Prefix	Text	1	\N	{}	f	\N
-11	companies	email	Email	Text	1	\N	{}	t	\N
-12	companies	address	Address	Text	1	\N	{}	f	\N
-13	companies	pan	Pan	File	1	\N	{}	t	\N
-14	companies	gst	GST	File	1	\N	{}	t	\N
-15	companies	upi	UPI	Text	1	\N	{}	t	\N
-16	companies	signature	Signature	File	1	\N	{}	f	\N
-17	companies	logo	Logo	File	1	\N	{}	f	\N
-18	companies	account_holder_name	Account Holder Name	Text	1	\N	{}	f	\N
-19	companies	bank_name	Bank Name	Text	1	\N	{}	f	\N
-20	companies	account_number	Account Number	Text	1	\N	{}	f	\N
-21	companies	ifsc_branch	IFSC & Branch	Text	1	\N	{}	f	\N
-22	companies	smtp_host	SMTP Host	Text	1	\N	{}	f	\N
-23	companies	smtp_port	SMTP Port	Text	1	\N	{}	f	\N
-24	companies	smtp_email	SMTP Email	Text	1	\N	{}	f	\N
-25	companies	smtp_password	SMTP Password	Text	1	\N	{}	f	\N
3	clients	passport	Passport	File	4	\N	{"options":[""]}	f	\N
2	clients	din_no	DIN No	File	3	\N	{"options":[""]}	f	\N
1	clients	adhaar_no	Adhaar No	File	2	\N	{"options":[""]}	f	\N
5	clients	udhyam_no	Udhyam No	File	6	\N	{"options":[""]}	f	\N
6	clients	food_license	Food License	File	7	\N	{"options":[""]}	f	\N
7	clients	cin	CIN	File	8	\N	{"options":[""]}	f	\N
8	clients	llpin	LLPIN	File	9	\N	{"options":[""]}	f	\N
9	clients	rof_registration_no	ROF registration No	File	10	\N	{"options":[""]}	f	\N
10	clients	iec	IEC	File	11	\N	{"options":[""]}	f	\N
11	clients	shop_and_establishment_no	Shop and Establishment No	Text	12	\N	{"options":[""]}	f	\N
12	clients	expiry_date	Expiry Date	Date	13	\N	{"options":[""]}	f	\N
13	clients	dob	DOB	Date	14	\N	{"options":[""]}	f	\N
14	clients	name_of_director	Name of Director	Text	15	\N	{"options":[""]}	f	\N
15	clients	mobile_no	Mobile No	Text	16	\N	{"options":[""]}	f	\N
4	clients	tan_no	Tan No	File	5	5	{"options":[""]}	f	\N
16	clients	gst_username	GST Username	Text	17	\N	{"options":[""]}	f	\N
17	clients	gst_password	GST Password	Text	18	\N	{"options":[""]}	f	\N
\.

COPY public.employees (id, username, password, role_id, is_admin, deleted) FROM stdin;
0	admin	240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9	-1	t	f
\.

COPY public.adonis_schema_versions (version) FROM stdin;
2
\.

COPY public.adonis_schema (id, name, batch, migration_time) FROM stdin;
1	database/migrations/1675419010637_roles	1	2024-02-01 14:28:21.777114+05:30
2	database/migrations/1675419023802_clients	1	2024-02-01 14:28:21.785097+05:30
3	database/migrations/1675419213958_companies	1	2024-02-01 14:28:21.789048+05:30
4	database/migrations/1675419218104_tasks	1	2024-02-01 14:28:21.794247+05:30
5	database/migrations/1675419226780_schedulers	1	2024-02-01 14:28:21.797944+05:30
6	database/migrations/1675419243827_registers_master	1	2024-02-01 14:28:21.801254+05:30
7	database/migrations/1675419249146_templates	1	2024-02-01 14:28:21.806035+05:30
8	database/migrations/1675419260303_leads	1	2024-02-01 14:28:21.81074+05:30
9	database/migrations/1675419264926_invoices	1	2024-02-01 14:28:21.814219+05:30
10	database/migrations/1675484900233_employees	1	2024-02-01 14:28:21.817228+05:30
11	database/migrations/1675528248412_master_templates	1	2024-02-01 14:28:21.823865+05:30
12	database/migrations/1676782135042_services	1	2024-02-01 14:28:21.829847+05:30
13	database/migrations/1676782186502_task_templates	1	2024-02-01 14:28:21.833001+05:30
14	database/migrations/1677341394108_register_templates	1	2024-02-01 14:28:21.836367+05:30
15	database/migrations/1678890659332_archived_tasks	1	2024-02-01 14:28:21.840972+05:30
16	database/migrations/1678890687359_archived_invoices	1	2024-02-01 14:28:21.845059+05:30
17	database/migrations/1679305739835_archived_register_templates	1	2024-02-01 14:28:21.848105+05:30
18	database/migrations/1699983596327_automators	1	2024-02-01 14:28:21.850962+05:30
\.

--
-- PostgreSQL database dump complete
--

