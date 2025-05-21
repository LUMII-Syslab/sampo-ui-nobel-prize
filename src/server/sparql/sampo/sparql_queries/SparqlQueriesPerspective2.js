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
    }
    UNION
    {
      ?id owl:sameAs ?wd_id .
      FILTER(isIRI(?wd_id))
    }
    UNION
    {
      # Retrieve full label of the laureate, if it exists (Doesn't seems that language tags are used).
      ?id rdfs:label ?fullName .
    }
    # Retrieve properties for the laureate that is a subclass of foaf:Person.
    UNION
    {  
      ?id dbp:dateOfBirth ?birthDate .
    }
    UNION
    {  
      ?id dbp:dateOfDeath ?deathDate .
    }
    UNION
    {
      ?id foaf:gender ?gender .
    }
    UNION
    {
      ?id dbo:affiliation ?affiliation__id .
      ?affiliation__id rdfs:label ?affiliationLabel .
      BIND(STR(?affiliationLabel) AS ?affiliation__prefLabel)
      BIND(STR(?affiliation__id) AS ?affiliation__dataProviderUrl)
    }
    UNION
    {
      # Birthplace property might have both a City and a Country as a value (TODO: Need to combine them)  
      ?id dbo:birthPlace ?birthPlace__id .
      ?birthPlace__id rdfs:label ?birthPlaceLabel__id ;
      # Retrieve the url to the dbo:Country or dbo:City in publicly available data provider.
                      owl:sameAs ?birthPlaceLabel__dataProviderUrl .
      BIND(STR(?birthPlaceLabel__id) AS ?birthPlaceLabel__prefLabel)
      FILTER(LANG(?birthPlaceLabel__id) = 'en')
    }
    UNION
    {
      # Retrieve properties for the laureate that is a subclass of foaf:Organization.
      ?id sdo:foundingDate ?foundingDate .
    }
    UNION
    {
      ?id sdo:foundingLocation ?foundingLocation__id .
      ?foundingLocation__id rdfs:label ?foundingLocationLabel ;
                            owl:sameAs ?foundingLocation__dataProviderUrl .
      BIND(STR(?foundingLocationLabel) AS ?foundingLocation__prefLabel)
    }
`


export const laureateWikiDataQuery = [{
  sparqlQuery: `
  SELECT ?id ?wd_id ?laureateImage__url (STR(?laureateImage) as ?laureateImage__id) {
    VALUES (?id ?wd_id) { <ID_RELATED_SET> }

    ?wd_id wdt:P8024 [] ; # Ar laurēata ārējo datu kopas property cheku strādā diezgan ātri.
          # Q5 ir Wikidata ID, kas apzīmē personu (Human).
          wdt:P31 <http://www.wikidata.org/entity/Q5> ;
          wdt:P18 ?laureateImage .

    BIND(CONCAT("https://commons.wikimedia.org/w/thumb.php?f=",
            REPLACE(STR(?laureateImage), "^.+/(.+)$", "$1"),
            "&w=300") AS ?laureateImage__url)
  }
  `,
  dataSet: 'wikidata',
  templateFillerConfig: { relatedProperty: "wd_id" }
}]

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

export const laureatesByCategoryQuery = `
  SELECT (REPLACE(STRAFTER(STR(?category), "http://data.nobelprize.org/resource/category/"),"_", " ") as ?prefLabel) 
         ?instanceCount
         ?category
        # Have to use Distinct since nobelPrize endpoint has duplicate predicates that causes wrong aggregations
        {SELECT ?category (count(DISTINCT ?id) as ?instanceCount) 
          {
            <FILTER>
            VALUES ?facetClass {<FACET_CLASS>}
            ?id a ?facetClass ;
                nobel:laureateAward ?laureateAward .
            ?laureateAward nobel:category ?category .
          }
          GROUP BY ?category
        }
`;

export const laureatesByCategoryTimelineQuery = `
  SELECT (REPLACE(STRAFTER(STR(?nobelCategory),"http://data.nobelprize.org/resource/category/"), "_", " ") as ?category)
         (?nobelYear as ?xValue)
		     (count(distinct ?id) as ?yValue)
  {
  	<FILTER>
    VALUES ?facetClass { <FACET_CLASS> }
    ?id a ?facetClass ;
     	 nobel:laureateAward ?laureateAward .
     ?laureateAward nobel:year ?nobelYear  ;
                    nobel:category ?nobelCategory .
  }
  GROUP BY ?nobelCategory ?nobelYear
  ORDER BY desc(?nobelCategory) asc(?nobelYear)
`;

export const laureateBirthCountryMapQuery = [{
  sparqlQuery: `
    SELECT DISTINCT ?id ?wiki_country_id ?instanceCount WHERE {
      {
        select ?id (count(DISTINCT ?laureate) as ?instanceCount) 
        {
          <FILTER>
          ?laureate a nobel:Laureate ;
              dbo:birthPlace ?id .
          # Only consider countries (ignore cities)
          FILTER(EXISTS {?id a dbo:Country .})
        }
        GROUP BY ?id
      }
      {
        ?id a dbo:Country ;
            owl:sameAs ?wiki_country_id .
      }
    }`
  },
  {
    sparqlQuery: `
      SELECT ?id ?wiki_country_id (xsd:decimal(?lonStr) AS ?long) (xsd:decimal(?latStr) AS ?lat) {
        VALUES (?id ?wiki_country_id) { <ID_RELATED_SET> }
  
        # Q6256 ir Wikidata ID, kas apzīmē valsti.
        ?wiki_country_id wdt:P31 <http://www.wikidata.org/entity/Q6256> ;
                         wdt:P625 ?coordinatesRaw .
  
        # Wikidata tiek pilsētas koordinātas glabātas iekš wktWKT literal, bet SAMPO-UI nepieciešami platuma un garuma grādi, tādēļ tos te izgūstam no teksta literāļa.
        BIND(REPLACE(STR(?coordinatesRaw), "^Point\\\\(|\\\\)$", "") AS ?coordPair)
        BIND(STRBEFORE(?coordPair, " ") AS ?lonStr)
        BIND(STRAFTER(?coordPair, " ") AS ?latStr)
      }
    `,
    dataSet: 'wikidata',
    templateFillerConfig: { relatedProperty: "wiki_country_id" }
  }];


export const laureatesWithMultiplePrizesQuery = `
# Distinct since official nobel prize SPARQL endpoint has duplicate properties for entities.
SELECT distinct (?id as ?category) ?prefLabel ?instanceCount 
{
  {
    SELECT ?id (count(distinct ?laureateAward) as ?instanceCount)
    {
      <FILTER>
      VALUES ?facetClass { <FACET_CLASS> }
      ?id a ?facetClass ;
          nobel:laureateAward ?laureateAward .
    }
    GROUP BY ?id
    HAVING(?instanceCount > 1)
  }
  FILTER(BOUND(?id))
  {
    ?id foaf:name ?prefLabel .

  }
}
ORDER BY desc(?instanceCount)
`;

export const laureateBirthCountryInstancePropertyQuery = `
       {
          ?id a dbo:Country ;
              rdfs:label ?prefLabel__id ;
              owl:sameAs ?prefLabel__dataProviderUrl .
          BIND(?prefLabel__id AS ?prefLabel__prefLabel) 
          # TODO: Possibly use <LANGTAG> instead of hardcoding it.
          FILTER(LANG(?prefLabel__id) = "en")    
       }`;

export const laureateBirthCountryMapRelatedQuery = `
OPTIONAL {
  <FILTER>
  ?related__id dbo:birthPlace ?id ;
               a nobel:Laureate ;
               rdfs:label ?related__prefLabel .
  # Laureates do not have a language tag.
  #FILTER(LANG(?related__prefLabel) = "en")
  BIND(CONCAT("/${perspectiveID}/page/", REPLACE(STR(?related__id), "^.*\\\\/(.+)", "$1")) AS ?related__dataProviderUrl)
}`;