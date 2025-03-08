const perspectiveID = 'perspective1'

export const workProperties = `
    {
      ?id rdfs:label ?prefLabel__id ;
          nobel:category ?category__id .
      BIND(?prefLabel__id AS ?prefLabel__prefLabel)
      BIND(REPLACE(STR(?category__id), "^.*\\\\/(.+)", "$1") AS ?category__prefLabel)
      BIND(CONCAT("/${perspectiveID}/page/", ?category__prefLabel, REPLACE(STR(?id), "^.*\\\\/(.+)", "$1")) AS ?prefLabel__dataProviderUrl)
      BIND(?id as ?uri__id)
      BIND(?id as ?uri__dataProviderUrl)
      BIND(?id as ?uri__prefLabel)
      FILTER(LANG(?prefLabel__prefLabel) = 'en')
    }
`

export const knowledgeGraphMetadataQuery = `
  SELECT * 
  WHERE {
    ?id a sd:Dataset ;
        dct:title ?title ;
        dct:publisher ?publisher ;
        dct:rightsHolder ?rightsHolder ;
        dct:modified ?modified ;
        dct:source ?databaseDump__id .
    ?databaseDump__id skos:prefLabel ?databaseDump__prefLabel ;
                      mmm-schema:data_provider_url ?databaseDump__dataProviderUrl ;
                      dct:modified ?databaseDump__modified .
  }
`
