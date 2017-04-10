-- Modelo Físico EDGV 2.13 em Postgres/PostGIS

--SEQUÊNCIA DOS PROCESSOS
-- 1) Criação dos esquemas;
-- 2) Criação das tabela do domínio;
-- 3) Inserção de dados na tabela do domínio;
-- 4) Criação da modelagem edgv;
-- 5) Setagem dos "defaults" e as "contraints" dos atributos que possuem domínio associado


BEGIN;

SET check_function_bodies = false;

CREATE SCHEMA "pto";
CREATE SCHEMA "dominios";


CREATE TABLE "dominios"."sistema_geodesico" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."sistema_geodesico" TO public;
 

 
CREATE TABLE "dominios"."geometria_aproximada" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."geometria_aproximada" TO public;
 
 
CREATE TABLE "dominios"."materializado" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."materializado" TO public;

CREATE TABLE "dominios"."tipo_ref" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."tipo_ref" TO public;
 
CREATE TABLE "dominios"."tipo_pto_controle" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."tipo_pto_controle" TO public;

CREATE TABLE "dominios"."referencial_altim" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."referencial_altim" TO public;

CREATE TABLE "dominios"."metodo_implantacao" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."referencial_altim" TO public;

CREATE TABLE "dominios"."med_altura" (
   code SMALLINT PRIMARY KEY NOT NULL, 
   valor character varying(175) NOT NULL);
GRANT ALL ON TABLE "dominios"."med_altura" TO public;

--INSERCAO DE DADOS NO DOMINIO ###########################################################################

INSERT INTO "dominios"."geometria_aproximada" (code, valor) VALUES 
(2,'Não')
;

INSERT INTO "dominios"."tipo_ref" (code, valor) VALUES 
(1,'Altimétrico'),
(2,'Planimétrico'),
(3,'Planialtimétrico'),
(4,'Gravimétrico')
;

INSERT INTO "dominios"."tipo_pto_controle" (code, valor) VALUES 
(9,'Ponto de Controle'),
(12,'Centro Perspectivo'),
(13,'Ponto Fotogramétrico')
;

INSERT INTO "dominios"."materializado" (code, valor) VALUES 
(1,'Sim'),
(2,'Não')
;

INSERT INTO "dominios"."sistema_geodesico" (code, valor) VALUES 
(2,'SIRGAS2000'),
(3,'WGS-84')
;

INSERT INTO "dominios"."referencial_altim" (code, valor) VALUES 
(1,'Torres'),
(2,'Imbituba'),
(3,'Santana')
;


INSERT INTO "dominios"."metodo_implantacao" (code, valor) VALUES 
(1,'PRE'),
(2,'PPP')
;
INSERT INTO "dominios"."med_altura" (code, valor) VALUES 
(1,'Nível do Solo'),
(2,'Topo do Objeto')
;

--########################################################################################################
CREATE TABLE "pto"."pto_controle_p"(
	id serial NOT NULL PRIMARY KEY UNIQUE,
 	"geometria_aproximada" INTEGER NOT NULL REFERENCES "dominios"."geometria_aproximada" (code),
 	"tipo_ref" INTEGER NOT NULL REFERENCES "dominios"."tipo_ref" (code),
 	"tipo_pto_controle" INTEGER NOT NULL REFERENCES "dominios"."tipo_pto_controle" (code),
 	"materializado" INTEGER NOT NULL REFERENCES "dominios"."materializado" (code),
	"latitude" VARCHAR(15)  NOT NULL,
    "longitude" VARCHAR(15)  NOT NULL,
    "altitude_ortometrica" REAL,
    "altitude_geometrica" REAL NOT NULL,
    "cod_projeto" VARCHAR(15),
 	"sistema_geodesico" INTEGER NOT NULL REFERENCES "dominios"."sistema_geodesico" (code),
 	"referencial_altim" INTEGER NOT NULL REFERENCES "dominios"."referencial_altim" (code),
    "orgao_ente_resp" VARCHAR(30),
    "cod_ponto" VARCHAR(15) UNIQUE,
    "obs" TEXT,
    --extensao para a Sec Lev
    "coord_n" REAL NOT NULL,
    "coord_e" REAL NOT NULL,
    "fuso" VARCHAR(3),
    "med_altura" INTEGER NOT NULL REFERENCES "dominios"."med_altura" (code),
    "data_implantacao" DATE NOT NULL,
    "metodo_implantacao" INTEGER REFERENCES "dominios"."metodo_implantacao" (code),
    "referencia_implantacao"  INTEGER REFERENCES "pto"."pto_controle_p",
    "acuracia_horizontal" REAL NOT NULL,
    "acuracia_vertical" REAL NOT NULL,
    "path_croqui" TEXT NOT NULL,
    "path_vista_aerea" TEXT NOT NULL,
    "path_monografia" TEXT NOT NULL,
    "path_rinex" TEXT NOT NULL,
    "path_rel_implantacao" TEXT NOT NULL,
    "path_rel_acuracia" TEXT NOT NULL
);
SELECT AddGeometryColumn('pto', 'pto_controle_p','geom', 4674, 'POINT', 2 );
CREATE INDEX idx_pto_pto_controle_p_geom ON "pto"."pto_controle_p" USING gist (geom) WITH (FILLFACTOR=90);
ALTER TABLE "pto"."pto_controle_p" ALTER COLUMN geom SET NOT NULL;
GRANT ALL ON TABLE "pto"."pto_controle_p" TO public;
--########################################################################################################


-- AUXILIARES DE AQUISICAO GEOMETRICA - FIM


--ESTABELECENDO PRIVILEGIOS PARA OS GRUPOS DENTRO DAS CATEGORIAS
GRANT ALL ON SCHEMA "pto" TO public;
GRANT ALL ON SCHEMA "dominios" TO public;
GRANT ALL ON SCHEMA topology TO public;


-- ESTABELECENDO PRIVILEGIOS NAS SEQUENCIAS
GRANT ALL ON ALL SEQUENCES IN SCHEMA "pto" TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "dominios" TO public;

--########################################################################################################
-- Início - Cria as restrições e default de cada classe
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("geometria_aproximada" IN(1,2,999)), ALTER COLUMN "geometria_aproximada" SET DEFAULT 999;
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("tipo_ref" IN(1,2,3,999)), ALTER COLUMN "tipo_ref" SET DEFAULT 999;
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("tipo_pto_controle" IN(9,12,13,99,999)), ALTER COLUMN "tipo_pto_controle" SET DEFAULT 999;
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("materializado" IN(0,1,2,999)), ALTER COLUMN "materializado" SET DEFAULT 999;
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("sistema_geodesico" IN(1,2,3,4,5,6,999)), ALTER COLUMN "sistema_geodesico" SET DEFAULT 999;
ALTER TABLE "pto"."pto_controle_p" ADD CHECK ("referencial_altim" IN(1,2,3,4,6,999)), ALTER COLUMN "referencial_altim" SET DEFAULT 999;

-- Fim - Cria as restrições e default de cada classe
--########################################################################################################
GRANT ALL ON ALL SEQUENCES IN SCHEMA "pto" TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "dominios" TO public;


SET search_path TO pg_catalog,public,"pto","dominios";

COMMIT;
