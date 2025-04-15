const perspectiveID = 'nobelPrizes'

export const workProperties = `
    BIND(REPLACE(STR(?id), "^.*\\\\/(.+)", "$1") as ?local_id)
    # To use the same query block for paged and instance page, then we must decode from instance page last URL path the encoded resource URI.
    BIND(IF(EXISTS {?id a nobel:NobelPrize .}, ?id, IRI(CONCAT(REPLACE(STR(?id), "^(.*\\\\/).+", '$1'), REPLACE(?local_id, '___', '\\\\/')))) AS ?final_id)
    {
      ?final_id rdfs:label ?prefLabel__id ;
                nobel:category ?category__id ;
                nobel:year ?year__id .
      BIND(?prefLabel__id AS ?prefLabel__prefLabel)
      BIND(STR(?year__id) AS ?year__prefLabel)
      BIND(REPLACE(REPLACE(STR(?category__id), "^.*\\\\/(.+)", "$1"), "_"," ") AS ?category)
      BIND(CONCAT("/${perspectiveID}/page/", ?category, "___", ?year__prefLabel) AS ?prefLabel__dataProviderUrl)
      BIND(?final_id as ?uri__id)
      BIND(?final_id as ?uri__dataProviderUrl)
      BIND(?final_id as ?uri__prefLabel)
      FILTER(LANG(?prefLabel__prefLabel) = 'en')
    }
    OPTIONAL {?final_id nobel:motivation ?motivation.
              FILTER(LANG(?motivation) = 'en')}
`

export const laureatesByCategoryQuery = `
  SELECT (REPLACE(STRAFTER(STR(?category), STR(nobel:)),"_", " ") as ?prefLabel) 
         ?instanceCount
         ?category
        {SELECT ?category (count(?id) as ?instanceCount) 
          {
            <FILTER>
            VALUES ?facetClass {<FACET_CLASS>}
            ?id a ?facetClass ;
                nobel:category ?category.
          }
          GROUP BY ?category
        }
`;

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
