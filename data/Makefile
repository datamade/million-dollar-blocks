VPATH = raw:finished_files:build
include config.mk

GENERATED_FILES = 'house_boundaries.shp \
eitc.csv \
eitc.table \
house_boundaries.table \
merged_eitc.shp \
merged_eitc.geojson'

.PHONY: all clean full_clean

clean:
	rm -Rf build/*

full_clean: 
	rm -Rf build/*
	rm -Rf finished_files/*

all: $(GENERATED_FILES)

house_boundaries.shp:
	wget -O raw/house_and_senate.zip http://ilhousedems.com/redistricting/2011-maps/Legislative_Districts_Public_Act/House%20and%20Senate%20shape%20files.zip
	mv raw/PA\ 97-6\ House\ Districts.dbf raw/house_boundaries.dbf
	mv raw/PA\ 97-6\ House\ Districts.prj raw/house_boundaries.prj
	mv raw/PA\ 97-6\ House\ Districts.sbn raw/house_boundaries.sbn
	mv raw/PA\ 97-6\ House\ Districts.sbx raw/house_boundaries.sbx
	mv raw/PA\ 97-6\ House\ Districts.shp raw/house_boundaries.shp
	mv raw/PA\ 97-6\ House\ Districts.shx raw/house_boundaries.shx
	mv raw/PA\ 97-6\ House\ Districts.xml raw/house_boundaries.xml

eitc.csv:
	iconv -f ISO-8859-1 -t UTF-8 \
		raw/"IL EITC Data by State House Legislative District v4.csv" > build/$@

eitc.table: eitc.csv
	psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT) -c "DROP TABLE IF EXISTS info_by_dist"
	csvsql build/$(notdir $?) \
		--db "postgresql://$(PG_USER):@$(PG_HOST):$(PG_PORT)/$(PG_DB)" --table info_by_dist --insert
	@touch build/$@

house_boundaries.table: house_boundaries.shp
	shp2pgsql -I -s 4326 -d raw/$(notdir $?) house_boundaries | \
		psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT)
	@touch build/$@

merged_eitc.shp: house_boundaries.table eitc.table
	@pgsql2shp -f finished_files/$@ -h $(PG_HOST) -u $(PG_USER) -p $(PG_PORT) $(PG_DB) \
		"SELECT house_boundaries.geom, info_by_dist.* FROM house_boundaries \
		JOIN info_by_dist ON house_boundaries.district_1 = cast(info_by_dist.ilhousedist as smallint)"

merged_eitc.geojson: merged_eitc.shp
	@ogr2ogr -simplify 0.0001 -f GeoJSON finished_files/$@ finished_files/$(notdir $?); \
