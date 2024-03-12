-- * SQLBook: Code


-- * 1 COMPANIES CATALOGUE

create sequence companies_id_seq;

alter sequence companies_id_seq owner to postgres;

SELECT setval('companies_id_seq', 4, true);

create table companies_catalogue
(
    id   bigint default nextval('companies_id_seq'::regclass) not null
        constraint companies_pk
            primary key,
    name varchar(255)                                         not null,
    city varchar(255)                                         not null
);

alter table companies_catalogue
    owner to postgres;

create unique index companies_id_uindex
    on companies_catalogue (id);

INSERT INTO public.companies_catalogue (id,name,city) VALUES (0,'AROL', 'Canelli, Asti');
INSERT INTO public.companies_catalogue (id,name,city) VALUES (1,'Company 1', 'Milan, Milan');
INSERT INTO public.companies_catalogue (id,name,city) VALUES (2,'Company 2', 'Rome, Rome');
INSERT INTO public.companies_catalogue (id,name,city) VALUES (3,'Company 3', 'Molfetta, Bari');
INSERT INTO public.companies_catalogue (id,name,city) VALUES (4,'PoliTO S.R.L.', 'Turin, Turin');


-- * 2 USERS

create sequence users_id_seq;

alter sequence users_id_seq owner to postgres;

SELECT setval('users_id_seq', 20, true);

create table users
(
    id         bigint  default nextval('users_id_seq'::regclass)            not null
        constraint users_pk
            primary key,
    email      varchar(255)                                                  not null,
    password   varchar(255)                                                  not null,
    roles      varchar(1024)                                                 not null,
    active     boolean default true                                          not null,
    company_id bigint
        constraint users_companies_catalogue_id_fk
            references companies_catalogue
            on update cascade on delete cascade,
    created_at bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    created_by varchar(255)                                                  not null,
    surname    varchar(255),
    name       varchar(255),
    is_temp    boolean default true                                          not null
);

alter table users
    owner to postgres;

create unique index users_email_uindex
    on users (email);

create unique index users_id_uindex
    on users (id);

INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (2,'mariodeda2@hotmail.com','$2b$10$MHhjGHz7OPL6JY3/VwZuEOetPCAbvotpxn.jaxDl0CYiO9iYSLnJa','COMPANY_ROLE_WORKER',true,1,1669996625020,'5','Account','Test',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (5,'mariodeda@hotmail.com','$2b$10$ASmkHx7yzmYppuKQOswQp.Cdi1d/kRXub4qc6lFVndNVctrXyqo.q','COMPANY_ROLE_ADMIN',true,1,1665073565677,'web-portal','Deda','Mario',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (4,'test2@hotmail.com','$2b$10$LE8MsVIdpIVAGmBv1R.RtOowzQAyagpgvhGOnslePrrCSPpXwBrOa','COMPANY_ROLE_WORKER',true,1,1670346982846,'2','Account 2','Test',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (3,'worker@hotmail.com','$2b$10$LE8MsVIdpIVAGmBv1R.RtOowzQAyagpgvhGOnslePrrCSPpXwBrOa','COMPANY_ROLE_MANAGER,COMPANY_ROLE_WORKER',true,1,1670346704392,'2','Account','Worker',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (6,'alessandro.rossi@company2.com','$2b$10$XuIkwJbJazLGM1eP7fEFGO8xUtmdQHkfaggs/VSGsnxfbbHzgwPhq','COMPANY_ROLE_ADMIN',true,2,1695726870132,'web-portal','Rossi','Alessandro',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (7,'sofia.conti@company3.com','$2b$10$0JhILtzoaz1toot3VB8/8O2JdEEcu/gFIgsDmydQF0AYzva90/MC2','COMPANY_ROLE_ADMIN',true,3,1695726932847,'web-portal','Conti','Sofia',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (8,'daniele.gallo@company4.com','$2b$10$AVQwkyI82vxyWc84/C4WduTKHyjTaWT4byfT6IvaqCmbP91iCktCi','COMPANY_ROLE_ADMIN',true,4,1695727008756,'web-portal','Gallo','Daniele',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (9,'luca.fanti@company2.com','$2b$10$x6P124myDzhJ7cx73qLaj..wrpUZa0FaCIP1eHQ3X7.yiqWE1Qv8O','COMPANY_ROLE_WORKER',true,2,1695727275856,'6','Fanti','Luca',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (10,'matteo.bianchi@company2.com','$2b$10$9/jP3fxvxo.m6PmsArFO1.o.Kw8CHjGp8fsSWd7rc0UGc2axL5LE6','COMPANY_ROLE_WORKER',true,2,1695727346042,'6','Bianchi','Matteo',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (11,'marta.mancini@company2.com','$2b$10$PJOvIxnKyiM.8I0tT3IPZuUypsnMau.EOOtN2ouUcQLPwX7oppFc6','COMPANY_ROLE_MANAGER,COMPANY_ROLE_WORKER',true,2,1695727388051,'6','Mancini','Marta',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (12,'paolo.bitta@company3.com','$2b$10$bgsMVDooS2s55Zj/vZIFe.P8.ufNtDXkPPHkdnixdAWZK/aSwas9i','COMPANY_ROLE_WORKER',true,3,1695727537663,'7','Bitta','Paolo',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (13,'luca.nervi@company3.com','$2b$10$.xoIYyzN6sLtoWC2c3fe0eRcOQcjQEfCdaYBEpfAdWhMq4.9j6v36','COMPANY_ROLE_WORKER',true,3,1695727468028,'7','Nervi','Luca',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (14,'iliaria.tanadale@company3.com','$2b$10$z6noEg64dmDtq2M6lUTAqup4I1asrFPcHYK34XxLKNKnZK9z1bQKK','COMPANY_ROLE_MANAGER,COMPANY_ROLE_WORKER',true,3,1695727617578,'7','Tanadale','Ilaria',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (15,'davide.colombo@company4.com','$2b$10$4AOePijJh38gpD1bil1nT.yTXeWe.Q6Ykvhz0gnferUUei1Rxu.l.','COMPANY_ROLE_WORKER',true,4,1695727678201,'8','Colombo','Davide',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (16,'francesco.esposito@company4.com','$2b$10$ps0bVIaoiSDruKoGamFoweXqlc1zWBPGDYdA2O7KHZOt1EBi0wIp.','COMPANY_ROLE_WORKER',true,4,1695727713181,'8','Esposito','Francesco',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (17,'aurora.lombardi@company4.com','$2b$10$cf5WbH95CNYuXirG7gHHRO88emGlusIy.ncUypYV/Eigi5TuWlij2','COMPANY_ROLE_MANAGER,COMPANY_ROLE_WORKER',true,4,1695727745888,'8','Lombardi','Aurora',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (18,'giuseppe.ferrari@arol.it','$2b$10$KTU9xhTb8mZ/BOg7uxD83u1kgRS.VsBciqUjcgKIyY4ynBpXK8YLi','AROL_ROLE_CHIEF',true,0,1696352777563,'web-portal','Ferrari','Giuseppe',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (19,'elena.verdi@arol.it','$2b$10$wfEInWiSex4s91wAP61P0.VTNIJ6QN6X6VwjLMGrw5f1a0BaEFDsC','AROL_ROLE_SUPERVISOR',true,0,1699175854759,'18','Verdi','Elena',false);
INSERT INTO public.users (id,email,password,roles,active,company_id,created_at,created_by,surname,name,is_temp) VALUES (20,'gualtiero.bianchi@arol.it','$2b$10$TTyBkL6K3gmhGmhNgv1HcO.Es1rPE5S65FnFwqmI9u57QXGzQAT.K','AROL_ROLE_OFFICER',true,0,1699175726141,'18','Bianchi','Gualtiero', false);


-- * 3 MACHINERIES CATALOGUE

create table machineries_catalogue
(
    model_id varchar(255) not null
        constraint machineries_catalogue_pk
            primary key,
    name     varchar(255) not null,
    type     varchar(255) not null
);

alter table machineries_catalogue
    owner to postgres;

create unique index machineries_catalogue_model_id_uindex
    on machineries_catalogue (model_id);

INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EUPK-FB', 'Euro PK Flat Buffer', 'Tappatore');
INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EM', 'Elevatore Meccanico', 'Elevatore capsule');
INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EQUA', 'Equatorque PK', 'Tappatore');


-- * 4 COMPANY-MACHINERIES

create table company_machineries
(
    machinery_uid      varchar(255)      not null
        constraint company_machineries_pk
            primary key,
    machinery_model_id varchar(255)      not null
        constraint company_machineries_machineries_catalogue_model_id_fk
            references machineries_catalogue
            on update cascade on delete cascade,
    company_id         bigint            not null
        constraint company_machineries_companies_catalogue_id_fk
            references companies_catalogue
            on update cascade on delete cascade,
    geo_location       point,
    location_cluster   varchar(255)      not null,
    num_heads          integer default 1 not null
);

alter table company_machineries
    owner to postgres;

create unique index company_machineries_machinery_uid_uindex
    on company_machineries (machinery_uid);

INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB056', 'EM', 1, '(45.013658,7.618732)', 'Mirafiori Sud, Torino', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB098', 'EM', 1, '(44.729519,8.296058)', 'Canelli, Asti', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF893', 'EQUA', 1, '(44.729826,8.295413)', 'Canelli, Asti', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF890', 'EQUA', 1, '(45.014035,7.6194)', 'Mirafiori Sud, Torino', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('WM100', 'EUPK-FB', 1, '(45.013674,7.620022)', 'Mirafiori Sud, Torino', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF891', 'EQUA', 1, '(45.013505,7.619129)', 'Mirafiori Sud, Torino', 24);

INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB906', 'EM', 4, '(41.203242, 16.562097)', 'Molfetta, Bari', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB998', 'EM', 4, '(41.203128, 16.562840)', 'Molfetta, Bari', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF897', 'EQUA', 4, '(41.203505, 16.563910)', 'Molfetta, Bari', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF110', 'EQUA', 4, '(41.202746, 16.563113)', 'Molfetta, Bari', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('WM130', 'EUPK-FB', 4, '(41.203082, 16.562908)', 'Molfetta, Bari', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF441', 'EQUA', 4, '(41.203151, 16.562491)', 'Molfetta, Bari', 24);

INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XA906', 'EM', 3, '(41.826642, 12.471354)', 'EUR, Roma', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XA998', 'EM', 3, '(41.826557, 12.471308)', 'EUR, Roma', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JG897', 'EQUA', 3, '(41.826648, 12.471328)', 'EUR, Roma', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JG110', 'EQUA', 3, '(41.881192, 12.517390)', 'Tuscolano Nord, Roma', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('WN130', 'EUPK-FB', 3, '(41.881258, 12.517566)', 'Tuscolano Nord, Roma', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JX441', 'EQUA', 3, '(41.884301, 12.468641)', 'Tiburtina, Roma', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JY441', 'EQUA', 3, '(41.89026, 12.49222)', 'Roma, Roma', 24); 

INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YA906', 'EM', 2, '(45.481801, 9.249244)', 'Lambrate, Milano', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YA998', 'EM', 2, '(45.481885, 9.249222)', 'Lambrate, Milano', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YG897', 'EQUA', 2, '(45.481888, 9.249341)', 'Lambrate, Milano', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YG110', 'EQUA', 2, '(45.476892, 9.130925)', 'San Siro, Milano', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YN130', 'EUPK-FB', 2, '(45.489076, 9.125608)', 'Lampugnano, Milano', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('YX441', 'EQUA', 2, '(45.516847, 9.192249)', 'Niguarda, Milano', 24);


-- * 5 SENSOR CATALOGUE

CREATE TABLE sensors_catalogue
(
    sensor_name                 VARCHAR(255)          NOT NULL,
    sensor_description          VARCHAR(2048)         NOT NULL,
    sensor_unit                 VARCHAR(255)          NOT NULL,
    sensor_threshold_low        DOUBLE PRECISION,
    sensor_threshold_high       DOUBLE PRECISION,
    sensor_internal_name        VARCHAR(255)          NOT NULL,
    sensor_category             VARCHAR(255)          NOT NULL,
    sensor_type                 VARCHAR(255)          NOT NULL,
    sensor_img_filename         VARCHAR(255),
    sensor_img_pointer_location POINT,
    sensor_bucketing_type       VARCHAR(64)           NOT NULL,
    PRIMARY KEY (sensor_category, sensor_internal_name)
);

CREATE INDEX sensors_catalogue_sensors_pk_index
    ON sensors_catalogue (sensor_category, sensor_internal_name);

INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Average Friction', 'Description', 'Newton', null, null, 'AverageFriction', 'eqtq', 'operational', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Maximum Lock Position', 'Description', 'Degrees', null, null, 'MaxLockPosition', 'eqtq', 'operational', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Minumum Lock Position', 'Description', 'Degrees', null, null, 'MinLockPosition', 'eqtq', 'operational', null, null, 'min');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Average Torque', 'Description', 'N•m', null, null, 'AverageTorque', 'eqtq', 'operational', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Bad Closure Status', 'Description', 'Units', null, null, 'stsBadClosure', 'eqtq', 'operational', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Current', 'Description', 'Amperes', null, null, 'PowerCurrent', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Main Motor Current', 'Description', 'Amperes', null, null, 'MainMotorCurrent', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Voltage', 'Description', 'Volts', null, null, 'PowerVoltage', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Head Motor Current', 'Description', 'Amperes', null, null, 'HeadMotorCurrent', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Operation State', 'Description', 'Status', null, null, 'OperationState', 'plc', 'status', null, null, 'majority');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Main Motor Speed', 'Description', 'RPM', null, null, 'MainMotorSpeed', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Lubricant Level', 'Description', 'Litres', null, null, 'LubeLevel', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Air Consumption', 'Description', 'Litres/second', null, null, 'AirConsumption', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Total Product', 'Description', 'Total Units', null, null, 'TotalProduct', 'plc', 'status', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Production Speed', 'Description', 'Units/hour', null, null, 'ProdSpeed', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Operation Mode', 'Description', 'Status', null, null, 'OperationMode', 'plc', 'status', null, null, 'majority');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Head Motor Speed', 'Description', 'RPM', null, null, 'HeadMotorSpeed', 'plc', 'status', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Test 2', 'Description', 'Units', null, null, 'test2', 'plc', 'status', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Alarm', 'Description', 'Status', null, null, 'Alarm', 'plc', 'status', null, null, 'majority');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Test 1', 'Description', 'Units', null, null, 'test1', 'plc', 'status', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Test 3', 'Description', 'Units', null, null, 'test3', 'plc', 'status', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'CPU Temperature', 'Description', 'Celsius', null, null, 'Tcpu', 'drive', 'temperature', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Total Count Status', 'Description', 'Units', null, null, 'stsTotalCount', 'eqtq', 'operational', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Board Temperature', 'Description', 'Celsius', null, null, 'Tboard', 'drive', 'temperature', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Windings Temperature', 'Description', 'Celsius', null, null, 'Twindings', 'drive', 'temperature', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'OK Closure Status', 'Description', 'Units', null, null, 'stsClosureOK', 'eqtq', 'operational', null, null, 'max');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'Plate Temperature', 'Description', 'Celsius', null, null, 'Tplate', 'drive', 'temperature', null, null, 'average');
INSERT INTO public.sensors_catalogue ( sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ( 'No Load Status', 'Description', 'Units', null, null, 'stsNoLoad', 'eqtq', 'operational', null, null, 'max');    


-- * 6 MACHINERY SENSORS

create table machinery_sensors
(
    machinery_uid               varchar(255)          not null
        constraint machinery_sensors_company_machineries_null_fk
            references company_machineries,
    sensor_category             varchar(255)          not null,
    sensor_internal_name        varchar(255)          not null,
    is_head_mounted      boolean default false not null,
    constraint machinery_sensors_sensors_catalogue_fk
        foreign key (sensor_category, sensor_internal_name)
            references sensors_catalogue (sensor_category, sensor_internal_name)
);

alter table machinery_sensors
    owner to postgres;

create index machinery_sensors_machinery_model_id_index
    on machinery_sensors (machinery_uid);

INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','AverageFriction',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','MaxLockPosition',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','MinLockPosition',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','AverageTorque',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','stsBadClosure',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','PowerCurrent',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','MainMotorCurrent',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','PowerVoltage',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','HeadMotorCurrent',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','OperationState',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','MainMotorSpeed',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','LubeLevel',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','AirConsumption',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','TotalProduct',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','ProdSpeed',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','OperationMode',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','HeadMotorSpeed',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','test2',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','Alarm',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','test1',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','plc','test3',false);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','drive','Tcpu',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','stsTotalCount',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','drive','Tboard',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','drive','Twindings',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','stsClosureOK',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','drive','Tplate',true);
INSERT INTO public.machinery_sensors(machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ('JF891','eqtq','stsNoLoad',true);


-- * 7 REFRESH TOKEN

create table refresh_tokens
(
    user_id       bigint       not null
        constraint refresh_tokens_users_id_fk
            references users
            on update cascade on delete cascade,
    refresh_token varchar(255) not null,
    expiration    bigint       not null
);

alter table refresh_tokens
    owner to postgres;

create unique index refresh_tokens_refresh_token_uindex
    on refresh_tokens (refresh_token);

create index refresh_tokens_user_id_index
    on refresh_tokens (user_id);


-- * 8 MACHINERY DOCUMENTS

create table machinery_documents
(
    machinery_uid          varchar(1024)                                                 not null
        constraint machinery_documents_company_machineries_machinery_uid_fk
            references company_machineries
            on update cascade on delete cascade,
    location               varchar(1024)                                                 not null,
    name                   varchar(1024)                                                 not null,
    is_dir                 boolean                                                       not null,
    is_document            boolean                                                       not null,
    document_uid           varchar(1024),
    creation_timestamp     bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    size_bytes             double precision                                              not null,
    created_by             integer                                                       not null,
    modification_timestamp bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    is_modifiable          boolean default true                                          not null,
    modified_by            integer                                                       not null,
    is_private             boolean default true                                          not null,
    constraint machinery_documents_pk
        primary key (location, name)
);

alter table machinery_documents
    owner to postgres;

create unique index machinery_documents_document_uid_uindex
    on machinery_documents (document_uid);


-- * 9 MACHINERY PERMISSIONS

create table machinery_permissions
(
    machinery_uid     varchar(255)          not null
        constraint machinery_permissions_company_machineries_null_fk
            references company_machineries,
    user_id           bigint                not null
        constraint machinery_permissions_users_null_fk
            references users,
    dashboards_write  boolean               not null,
    dashboards_modify boolean default false not null,
    dashboards_read   boolean default false not null,
    documents_write   boolean default false not null,
    documents_modify  boolean default false not null,
    documents_read    boolean default false not null,
    constraint machinery_permissions_pk
        primary key (machinery_uid, user_id)
);

alter table machinery_permissions
    owner to postgres;

INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB056', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF893', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB056', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF893', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB906', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB998', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF897', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF110', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM130', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF441', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 2, true, true, true, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB056', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 2, false, false, false, false, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 2, false, false, false, false, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 3, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 3, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF893', 3, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YX441', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YN130', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YG110', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YG897', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YA998', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YA906', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JX441', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WN130', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JG110', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JG897', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XA998', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XA906', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JY441', 18, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YN130', 19, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YG110', 19, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YG897', 19, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('YA998', 19, true, true, true, true, true, true);


-- * 10 MACHINERY DASHBOARDS

create sequence public.machinery_dashboards_id_seq1
    as integer;

alter sequence public.machinery_dashboards_id_seq1 owner to postgres;

SELECT setval('machinery_dashboards_id_seq1', 4, true); -- ? TO CHECK

create table machinery_dashboards
(
    id            integer default nextval('machinery_dashboards_id_seq1'::regclass) not null
        constraint machinery_dashboards_pk
            primary key,
    machinery_uid varchar(1024)                                                     not null
        constraint machinery_dashboards_company_machineries_machinery_uid_fk
            references company_machineries
            on update cascade on delete cascade,
    dashboard     jsonb                                                             not null
);

alter table machinery_dashboards
    owner to postgres;

alter sequence public.machinery_dashboards_id_seq1 owned by public.machinery_dashboards.id;

INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (3, 'JF890', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 6, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 6, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Dec 23, 2022 22:52", "isNew": true, "userID": "5", "numCols": 12, "numRows": 4, "lastSave": 1671832371380, "isDefault": true, "timestamp": 1671832371380, "machineryUID": "JF890", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (4, 'JF891', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 6, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 6, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Dec 23, 2022 22:53", "isNew": true, "userID": "5", "numCols": 12, "numRows": 4, "lastSave": 1671832390657, "isDefault": false, "timestamp": 1671832390658, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (1, 'JF891', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 8, "x": 1, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Area chart", "type": "area-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Jul 21, 2023 18:34", "isNew": true, "userID": "2", "numCols": 12, "numRows": 4, "lastSave": 1689957273063, "isDefault": false, "timestamp": 1689957273064, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (2, 'JF891', '{"grid": {"layout": [{"h": 5, "i": "0", "w": 7, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 7, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "2", "w": 8, "x": 0, "y": 8, "moved": false, "static": false, "isDraggable": true}, {"h": 3, "i": "3", "w": 5, "x": 0, "y": 5, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": [{"headNumber": 1, "sensorNames": [{"name": "Twindings", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "Twindings", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "Twindings", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "Twindings", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "Twindings", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "Twindings", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "Twindings", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "Twindings", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "Twindings", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "Twindings", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "Twindings", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "Twindings", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "Twindings", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "Twindings", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "Twindings", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "Twindings", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "Twindings", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "Twindings", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "Twindings", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "Twindings", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "Twindings", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "Twindings", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "Twindings", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "Twindings", "color": "#a28b91"}]}]}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat 1", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "AverageTorque", "color": "#b4ddd4"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 1}, "requestType": "first-time", "aggregations": [], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "2", "name": "Bar chart", "type": "bar-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "stsClosureOK", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "stsClosureOK", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "stsClosureOK", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "stsClosureOK", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "stsClosureOK", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "stsClosureOK", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "stsClosureOK", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "stsClosureOK", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "stsClosureOK", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "stsClosureOK", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "stsClosureOK", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "stsClosureOK", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "stsClosureOK", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "stsClosureOK", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "stsClosureOK", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "stsClosureOK", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "stsClosureOK", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "stsClosureOK", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "stsClosureOK", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "stsClosureOK", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "stsClosureOK", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "stsClosureOK", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "stsClosureOK", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "stsClosureOK", "color": "#a28b91"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "3", "name": "Area chart", "type": "area-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "AverageFriction", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "AverageFriction", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "AverageFriction", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "AverageFriction", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "AverageFriction", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "AverageFriction", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "AverageFriction", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "AverageFriction", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "AverageFriction", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "AverageFriction", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "AverageFriction", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "AverageFriction", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "AverageFriction", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "AverageFriction", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "AverageFriction", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "AverageFriction", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "AverageFriction", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "AverageFriction", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "AverageFriction", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "AverageFriction", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "AverageFriction", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "AverageFriction", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "AverageFriction", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "AverageFriction", "color": "#a28b91"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard", "isNew": true, "userID": "5", "numCols": 12, "numRows": 13, "lastSave": 1689957139596, "isDefault": false, "timestamp": 1689957139596, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');


-- * 11 TRIGGERS

CREATE OR REPLACE FUNCTION public.remove_user_information()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
DECLARE
BEGIN
    DELETE FROM public.machinery_permissions WHERE user_id = OLD.id;
    DELETE FROM public.refresh_tokens WHERE user_id = OLD.id;
    RETURN OLD;
END;
$function$
;
CREATE OR REPLACE TRIGGER remove_user_information
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION remove_user_information();

CREATE OR REPLACE FUNCTION public.assign_all_permissions()
 RETURNS TRIGGER
 LANGUAGE plpgsql
AS $function$
DECLARE
    machineries VARCHAR(255)[];
    machinery VARCHAR(255);
BEGIN
	IF NOT (NEW.roles = 'AROL_ROLE_OFFICER' OR NEW.roles = 'AROL_ROLE_SUPERVISOR' OR NEW.roles = 'COMPANY_ROLE_WORKER' OR NEW.roles = 'COMPANY_ROLE_MANAGER')
	THEN
		IF NEW.company_id = 0 THEN
			SELECT array_agg(machinery_uid)
	    	INTO machineries
	    	FROM public.company_machineries;
	   	 	FOREACH machinery IN ARRAY machineries
	    	LOOP
	        	INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read)
	        	VALUES (machinery, NEW.id, true, true, true, true, true, true);
	    	END LOOP;	
		ELSE
			SELECT array_agg(machinery_uid)
	    	INTO machineries
	    	FROM public.company_machineries
	    	WHERE company_id = NEW.company_id;
	    	IF array_length(machineries, 1) != 0 THEN
		   	 	FOREACH machinery IN ARRAY machineries
		    	LOOP
		        	INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read)
		        	VALUES (machinery, NEW.id, true, true, true, true, true, true);
		    	END LOOP;
	    	END IF;
		END IF;
	END IF;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE TRIGGER assign_all_permissions 
AFTER INSERT ON public.users 
FOR EACH ROW EXECUTE FUNCTION assign_all_permissions();

CREATE OR REPLACE FUNCTION public.update_machinery_documents() 
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
DECLARE
    companyID INT;
    userID INT;
BEGIN
    SELECT company_id INTO companyID FROM public.users WHERE id = OLD.id;

    SELECT INTO userID id FROM public.users WHERE company_id=companyID AND roles LIKE 
    CASE WHEN companyID = 0 THEN '%AROL_ROLE_CHIEF%' ELSE '%COMPANY_ROLE_ADMIN%' END LIMIT 1;

    IF userID IS NULL THEN
        SELECT INTO userID id FROM public.users WHERE company_id=companyID AND roles LIKE 
        CASE WHEN companyID = 0 THEN '%AROL_ROLE_SUPERVISOR%' ELSE '%COMPANY_ROLE_MANAGER%' END LIMIT 1;
    END IF;

    IF userID IS NULL THEN
        SELECT INTO userID id FROM public.users WHERE company_id=companyID AND roles LIKE 
        CASE WHEN companyID = 0 THEN '%AROL_ROLE_OFFICER%' ELSE '%COMPANY_ROLE_WORKER%' END LIMIT 1;
    END IF;

    IF userID IS NULL THEN
        RAISE 'No highest role user found for company';
    END IF;

    UPDATE public.machinery_documents SET created_by=userID, modified_by=userID WHERE created_by=OLD.id;

    RETURN OLD;
END;
$function$
;
CREATE OR REPLACE TRIGGER update_machinery_documents
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_machinery_documents();

CREATE OR REPLACE FUNCTION public.assign_all_admin_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    users INT[];
   	userid INT;
BEGIN
	SELECT ARRAY(
		SELECT id 
        FROM public.users 
        WHERE (company_id = NEW.company_id OR company_id = 0)
        AND roles NOT LIKE '%COMPANY_ROLE_MANAGER%' 
        AND roles NOT LIKE '%COMPANY_ROLE_WORKER%'
        AND roles NOT LIKE '%AROL_ROLE_OFFICER%'
        AND roles NOT LIKE '%AROL_ROLE_SUPERVISOR%' 
        AND active = TRUE) 
	INTO users;

	IF array_length(users, 1) > 0 THEN
		FOREACH userid IN ARRAY users
		LOOP
			INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) 
			VALUES (NEW.machinery_uid, userid, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);
		END LOOP;
	END IF;
	RETURN NEW;
END;
$function$;

CREATE OR REPLACE TRIGGER assign_all_admin_permissions 
AFTER INSERT ON public.company_machineries
FOR EACH ROW EXECUTE FUNCTION assign_all_admin_permissions();

CREATE OR REPLACE FUNCTION public.delete_machinery()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
DECLARE
BEGIN
    DELETE FROM public.machinery_permissions WHERE machinery_uid = OLD.machinery_uid;
    DELETE FROM public.machinery_dashboards WHERE machinery_uid = OLD.machinery_uid;
    DELETE FROM public.machinery_documents WHERE machinery_uid = OLD.machinery_uid;
    DELETE FROM public.machinery_sensors WHERE machinery_uid = OLD.machinery_uid;
    RETURN OLD;
END;
$function$
;
CREATE OR REPLACE TRIGGER delete_machinery 
BEFORE DELETE ON public.company_machineries
FOR EACH ROW EXECUTE FUNCTION delete_machinery();

CREATE OR REPLACE FUNCTION public.delete_company_users()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
DECLARE
BEGIN
    DELETE FROM public.users WHERE company_id = OLD.id;
    RETURN OLD;
END;
$function$
;
CREATE OR REPLACE TRIGGER delete_company_users 
BEFORE DELETE ON public.companies_catalogue 
FOR EACH ROW EXECUTE FUNCTION delete_company_users();
