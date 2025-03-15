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