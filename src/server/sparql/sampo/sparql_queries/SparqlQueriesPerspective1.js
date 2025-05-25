const perspectiveID = 'nobelPrizes'

export const workProperties = `
    {
      ?id rdfs:label ?prefLabel__id ;
                nobel:category ?category__id ;
                nobel:year ?year .
      BIND(?prefLabel__id AS ?prefLabel__prefLabel)
      # For shown field we remove the underscores from category name, but we must preserve them for encoding the entity id.
      BIND(REPLACE(STR(?category__id), "^.*\\\\/(.+)", "$1") AS ?category_original)
      BIND(REPLACE(?category_original, "_", " ") AS ?category)
      BIND(CONCAT("/${perspectiveID}/page/", ENCODE_FOR_URI(STR(?id))) AS ?prefLabel__dataProviderUrl)
      BIND(?id as ?uri__id)
      BIND(?id as ?uri__dataProviderUrl)
      BIND(?id as ?uri__prefLabel)
      FILTER(LANG(?prefLabel__prefLabel) = 'en')
    }
    UNION
    {
      # Fetch nobel prize laureates
      ?id dcterms:hasPart ?laureateAward .
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
      ?id nobel:motivation ?motivation.
      FILTER(LANG(?motivation) = 'en')
    }
`

export const laureateSharesPerYearQuery = `
select (CONCAT("Prize shared by ", STR(?laureateCount), " laureates") as ?category) 
       (?prizeYear as ?xValue) 
       (count(distinct ?id) as ?yValue)
{
  select ?id ?prizeYear (count(distinct ?laureateAwards) as ?laureateCount)
  {
    <FILTER>
    VALUES ?facetClass { <FACET_CLASS> }
    ?id a ?facetClass ;
        nobel:year ?prizeYear ;
        dcterms:hasPart ?laureateAwards .
  }
  GROUP BY ?id ?prizeYear
}
GROUP BY ?laureateCount ?prizeYear
ORDER BY asc(?laureateCount)    
`;

export const laureateSharesPerCategoryQuery = `
select (CONCAT("Prize shared by ", STR(?laureateCount), " laureates") as ?category) 
       (REPLACE(STRAFTER(STR(?nobelCategory), STR(nobel:)), "_", " ") as ?xValue) 
       (count(distinct ?id) as ?yValue)
{
  select ?id ?nobelCategory (count(distinct ?laureateAwards) as ?laureateCount)
  {
    <FILTER>
    VALUES ?facetClass { <FACET_CLASS> }  
    ?id a ?facetClass ;
        nobel:category ?nobelCategory ;
        dcterms:hasPart ?laureateAwards .
  }
  GROUP BY ?id ?nobelCategory
}
GROUP BY ?laureateCount ?nobelCategory
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
