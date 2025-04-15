const perspectiveID = 'laureates'

export const workProperties = `
    {
      ?id foaf:name ?laureate_name_multi .
      # Try to retrieve the english version of the name only, if it exists.
      OPTIONAL { ?id foaf:name ?laureate_name_en
                 FILTER(LANG(?laureate_name_en) = 'en') }
      BIND(COALESCE(?laureate_name_en, ?laureate_name_multi) AS ?prefLabel__id)
      BIND(STR(?prefLabel__id) AS ?prefLabel__prefLabel)
      
      BIND(CONCAT("/${perspectiveID}/page/", REPLACE(STR(?id), "^.*\\\\/(.+)", "$1")) AS ?prefLabel__dataProviderUrl)
      BIND(?id as ?uri__id)
      BIND(?id as ?uri__dataProviderUrl)
      BIND(?id as ?uri__prefLabel)

      # Retrieve full label of the laureate, if it exists (Doesn't seems that language tags are used).
      OPTIONAL { ?id rdfs:label ?fullName__id .
                 BIND(STR(?fullName__id) AS ?fullName__prefLabel)
      }
      # Retrieve properties for the laureate that is a subclass of foaf:Person.
      OPTIONAL { SELECT * WHERE {
                 ?id dbp:dateOfBirth ?birthDate__id .
                 BIND(STR(?birthDate__id) AS ?birthDate__prefLabel) 
                 OPTIONAL {?id dbp:dateOfDeath ?deathDate__id .
                           BIND(STR(?deathDate__id) AS ?deathDate__prefLabel)
                          }
                 OPTIONAL {?id foaf:gender ?gender__id .
                           BIND(STR(?gender__id) AS ?gender__prefLabel)
                          }          
                 OPTIONAL {?id dbo:affiliation ?affiliation__id .
                           ?affiliation__id rdfs:label ?affiliationLabel .
                           BIND(STR(?affiliationLabel) AS ?affiliation__prefLabel)
                           BIND(STR(?affiliation__id) AS ?affiliation__dataProviderUrl)
                          } 
                 # Birthplace property might have both a City and a Country as a value (TODO: Need to combine them)
                 OPTIONAL {?id dbo:birthPlace ?birthPlace__id .
                           ?birthPlace__id rdfs:label ?birthPlaceLabel__id ;
                           # Retrieve the url to the dbo:Country or dbo:City in publicly available data provider.
                                           owl:sameAs ?birthPlaceLabel__dataProviderUrl .
                           BIND(STR(?birthPlaceLabel__id) AS ?birthPlaceLabel__prefLabel)
                           FILTER(LANG(?birthPlaceLabel__id) = 'en')
                          }             
                 }        
      }
      # Retrieve properties for the laureate that is a subclass of foaf:Organization.
      OPTIONAL { SELECT * WHERE {
                 ?id sdo:foundingDate ?foundingDate__id .
                 BIND(STR(?foundingDate__id) AS ?foundingDate__prefLabel) 
                 OPTIONAL {?id sdo:foundingLocation ?foundingLocation__id .
                            ?foundingLocation__id rdfs:label ?foundingLocationLabel ;
                                                  owl:sameAs ?foundingLocation__dataProviderUrl .
                           BIND(STR(?foundingLocationLabel) AS ?foundingLocation__prefLabel)
                          }
                 }
      }
    }
`

export const laureatesByBirthCountryQuery = `
    SELECT ?prefLabel 
           ?instanceCount
		       ?category
           {
            SELECT ?category ?prefLabel (count(?id) as ?instanceCount) 
           {
            <FILTER>
            VALUES ?facetClass {<FACET_CLASS>}
            ?id <FACET_CLASS_PREDICATE> ?facetClass ;
                dbo:birthPlace ?category .
    		    # Only interested in countries and not cities          
    		    ?category a dbo:Country ;
                      rdfs:label ?prefLabel .
            # TODO: Possibly use <LANGTAG> instead of hardcoding it.
      		  FILTER(LANG(?prefLabel) = "en")
    	     }
           GROUP BY ?category ?prefLabel
}`;

export const laureateBirthCountryMapQuery = `
SELECT DISTINCT ?id (xsd:decimal(?lonStr) AS ?long) (xsd:decimal(?latStr) AS ?lat) ?instanceCount WHERE {
  {
    select ?id (count(?laureate) as ?instanceCount) 
    {
      ?laureate a nobel:Laureate ;
  				dbo:birthPlace ?id.
      # Only consider countries (ignore cities)
      ?id a dbo:Country .
    }
    GROUP BY ?id
  }
  {
    ?id a dbo:Country ;
        owl:sameAs ?wiki_country_id .

    SERVICE <https://query.wikidata.org/sparql> {
      # Q6256 ir Wikidata ID, kas apzīmē valsti.
      ?wiki_country_id wdt:P31 <http://www.wikidata.org/entity/Q6256> ;
                       wdt:P625 ?coordinatesRaw .

      # Wikidata tiek pilsētas koordinātas glabātas iekš wktWKT literal, bet SAMPO-UI nepieciešami platuma un garuma grādi, tādēļ tos te izgūstam no teksta literāļa.
      BIND(REPLACE(STR(?coordinatesRaw), "^Point\\\\(|\\\\)$", "") AS ?coordPair)
      BIND(STRBEFORE(?coordPair, " ") AS ?lonStr)
      BIND(STRAFTER(?coordPair, " ") AS ?latStr)
    }
  }
}`;