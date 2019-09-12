FROM mongo

COPY init_emailusers.json /init_emailusers.json
COPY init_lexon.json /init_lexon.json

CMD mongoimport --host nosql.data --db LexonApiDB --collection Users --type json --file /init_lexon.json --jsonArray --verbose
CMD mongoimport --host nosql.data --db users-accounts --collection accounts --type json --file /init_emailusers.json --jsonArray --verbose