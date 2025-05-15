const perspectiveID = 'universities'

export const workProperties = `
    {
      ?id   rdfs:label ?prefLabel__id .
      BIND(?prefLabel__id AS ?prefLabel__prefLabel)
      BIND(CONCAT("/${perspectiveID}/page/", REPLACE(STR(?id), "^.*\\\\/(.+)", "$1")) AS ?prefLabel__dataProviderUrl)
      BIND(?final_id as ?uri__id)
      BIND(?final_id as ?uri__dataProviderUrl)
      BIND(?final_id as ?uri__prefLabel)
      FILTER(LANG(?prefLabel__prefLabel) = 'en')
    }
    UNION
    {
      ?id dbo:country ?country__id .
      ?country__id rdfs:label ?countryLabel ;
      # Retrieve the url to the dbo:Country in publicly available data provider.
                      owl:sameAs ?country__dataProviderUrl .
      BIND(STR(?countryLabel) AS ?country__prefLabel)
      FILTER(LANG(?countryLabel) = 'en')
    }                          
    UNION 
    {
      ?id dbo:city ?city__id .
      ?city__id rdfs:label ?cityLabel ;
      # Retrieve the url to the dbo:city publicly available data provider.
                      owl:sameAs ?city__dataProviderUrl .
      BIND(STR(?cityLabel) AS ?city__prefLabel)
      FILTER(LANG(?cityLabel) = 'en')              
    }
    # Interesting might be the difference between what is in the nobel:LaureateAward/university and what is in nobel:Laureate/affiliation 
    UNION
    {
      ?id ^nobel:university ?laureateAward .
      ?laureateAward ^nobel:laureateAward ?affiliatedLaureate__id .
      ?affiliatedLaureate__id rdfs:label ?affiliatedLaureate__prefLabel .
      
      BIND(CONCAT("/laureates/page/", REPLACE(STR(?affiliatedLaureate__id), "^.*\\\\/(.+)", "$1")) AS ?affiliatedLaureate__dataProviderUrl)
    }
    # Retrieve the most awarded category of the university.
    # Currently the actual ?count is incorrect as of result of the duplicate properties.
    UNION 
    {
   	SELECT ?id (REPLACE(STRAFTER(STR(?category), "http://data.nobelprize.org/resource/category/"),"_", " ") AS ?mostAwardsInCategory) {
          SELECT ?id ?category (count(?category) as ?count) 
          WHERE 
          {
            ?id ^nobel:university ?laureateAward .
            ?laureateAward nobel:category ?category .  
          }
          GROUP BY ?id ?category
          ORDER BY desc(?count)
          # Ar šo limit rodās problēmu, ja tiek union izmantots.
          # LIMIT 1
        }
    }         
`;

export const nobelPrizeSharedBetweenUniversitiesQuery = `
select 
    ?source
    ?target
    ?sourceLabel
    ?sourceSize
    ?targetLabel
    ?targetSize
    ?weight
    (STR(?weight) as ?prefLabel)
{
  {
    select ?source ?target ?sourceLabel ?targetLabel (count(*) as ?weight)
    {
      {
        select distinct *
        {
            <ID_VALUES_FILTER_TARGET_CLAUSE>    
            ?source a dbo:University ;
                rdfs:label ?sourceLabel ;
                    ^nobel:university/dcterms:isPartOf ?nobelPrize . 
            ?nobelPrize dcterms:hasPart/nobel:university ?target .
            ?target rdfs:label ?targetLabel .
            FILTER(?source != ?target)
            FILTER(LANG(?sourceLabel) = "en")
            FILTER(LANG(?targetLabel) = "en")
        }
      }
    }
	  GROUP BY ?source ?target ?sourceLabel ?targetLabel
  }
  {
    # Distinct jāpielieto, jo nobela prēmiju datu kopā īpašības dublējās, tādēļ ar distinct mēs tikai unikālās laureātu balvas uzskaitam.
    select ?source (count(distinct ?laureateAward) as ?sourceSize)
    {
      ?source a dbo:University ;
              ^nobel:university ?laureateAward .      
    }
    GROUP BY ?source
  }
  {
    # Distinct jāpielieto, jo nobela prēmiju datu kopā īpašības dublējās, tādēļ ar distinct mēs tikai unikālās laureātu balvas uzskaitam.
    select ?target (count(distinct ?laureateAward) as ?targetSize)
    {
      ?target a dbo:University ;
              ^nobel:university ?laureateAward .      
    }
    GROUP BY ?target
  }
}
`

export const laureatesByAffiliatedUniversityQuery = `
# Distinct since official nobel prize SPARQL endpoint has duplicate properties for entities.
SELECT distinct (?id as ?category) ?prefLabel ?instanceCount 
{
  {
    SELECT ?id (count(distinct ?laureateAward) as ?instanceCount)
    {
      VALUES ?facetClass { <FACET_CLASS> }
      ?id a ?facetClass ;
          ^nobel:university ?laureateAward .
      ?laureateAward dcterms:isPartOf ?nobelPrize .
    }
    GROUP BY ?id
    ORDER BY desc(?instanceCount)
    LIMIT 15
  }
  FILTER(BOUND(?id))
  {
    ?id rdfs:label ?prefLabel
    FILTER(LANG(?prefLabel) = 'en')
  }
}
ORDER BY desc(?instanceCount)
`;