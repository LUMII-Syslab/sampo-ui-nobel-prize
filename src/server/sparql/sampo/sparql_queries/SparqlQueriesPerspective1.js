const perspectiveID = 'nobelPrizes'

export const workProperties = `
    BIND(REPLACE(STR(?id), "^.*\\\\/(.+)", "$1") as ?local_id)
    # To use the same query block for paged and instance page, then we must decode from instance page last URL path the encoded resource URI.
    BIND(IF(EXISTS {?id a nobel:NobelPrize .}, ?id, IRI(CONCAT(REPLACE(STR(?id), "^(.*\\\\/).+", '$1'), REPLACE(?local_id, '___', '\\\\/')))) AS ?final_id)
    {
      ?final_id rdfs:label ?prefLabel__id ;
                nobel:category ?category__id ;
                nobel:year ?year .
      BIND(?prefLabel__id AS ?prefLabel__prefLabel)
      # For shown field we remove the underscores from category name, but we must preserve them for encoding the entity id.
      BIND(REPLACE(STR(?category__id), "^.*\\\\/(.+)", "$1") AS ?category_original)
      BIND(REPLACE(?category_original, "_", " ") AS ?category)
      BIND(CONCAT("/${perspectiveID}/page/", ?category_original, "___", STR(?year)) AS ?prefLabel__dataProviderUrl)
      BIND(?final_id as ?uri__id)
      BIND(?final_id as ?uri__dataProviderUrl)
      BIND(?final_id as ?uri__prefLabel)
      FILTER(LANG(?prefLabel__prefLabel) = 'en')
    }
    UNION
    {
      # Fetch nobel prize laureates
      ?final_id dcterms:hasPart ?laureateAward .
      ?laureateAward nobel:laureate ?laureate__id ;
                     nobel:sortOrder ?laureate__sortOrder ;
                     nobel:share     ?laureate__share .
      # TODO: Potentially limit it to user locale.
      ?laureate__id rdfs:label ?laureateLabel .

      # TODO: Is it possible that some laureateAward will not have motivation predicate set?
      OPTIONAL {
        ?laureateAward nobel:motivation ?laureate__motivation . 
        FILTER(LANG(?laureate__motivation) = 'en')
      }

      BIND(CONCAT(?laureateLabel, " (1/", STR(?laureate__share), " share)") AS ?laureateLabelWithShare)
      BIND(CONCAT(IF(?laureate__share = 1, ?laureateLabel, ?laureateLabelWithShare), " - ", ?laureate__motivation) AS ?laureate__prefLabel)
      BIND(CONCAT("/laureates/page/", REPLACE(STR(?laureate__id), "^.*\\\\/(.+)", "$1")) AS ?laureate__dataProviderUrl)
    }
    UNION 
    {
      ?final_id nobel:motivation ?motivation.
      FILTER(LANG(?motivation) = 'en')
    }
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
