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
      ?id a ?type .
      FILTER(?type != nobel:Laureate)

      BIND(STRAFTER(STR(?type), STR(foaf:)) as ?type__id)
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
      BIND(CONCAT("/universities/page/", REPLACE(STR(?affiliation__id), "^.*\\\\/(.+)", "$1")) AS ?affiliation__dataProviderUrl)
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
      FILTER(isIRI(?birthPlaceLabel__dataProviderUrl))
    }
    UNION
    {
      # Retrieve properties for the laureate that is a subclass of foaf:Organization.
      ?id sdo:foundingDate ?foundingDate .
    }
    UNION
    {
      ?id dcterms:created ?foundingDate .
      FILTER(NOT EXISTS {?id sdo:foundingDate ?foundingDate})
    }
    UNION
    {
      ?id sdo:foundingLocation ?foundingLocation__id .
      ?foundingLocation__id rdfs:label ?foundingLocationLabel ;
                            owl:sameAs ?foundingLocation__dataProviderUrl .
      BIND(STR(?foundingLocationLabel) AS ?foundingLocation__prefLabel)
      FILTER(isIRI(?foundingLocation__dataProviderUrl))
    }
    UNION
    {
      ?id nobel:nobelPrize ?nobelPrize__id .
      ?nobelPrize__id rdfs:label ?nobelPrizeLabel .
      BIND(CONCAT("/nobelPrizes/page/", ENCODE_FOR_URI(STR(?nobelPrize__id))) AS ?nobelPrize__dataProviderUrl)
      ?nobelPrize__id nobel:year ?nobelPrize__prizeYear ;
                      dcterms:hasPart ?laureateAwardId .
      ?laureateAwardId ^nobel:laureateAward ?id .
      
      OPTIONAL {
        ?laureateAwardId nobel:motivation ?nobelPrizeMotivation .
        FILTER(LANG(?nobelPrizeMotivation) = 'en')
      }         

      BIND(CONCAT(?nobelPrizeLabel, ' - ', ?nobelPrizeMotivation) as ?nobelPrize__prefLabel)
      FILTER(LANG(?nobelPrizeLabel) = 'en')
    }
    UNION
    {
      ?id owl:sameAs ?otherId__id .
      BIND(STR(?otherId__id) AS ?otherId__prefLabel)
      BIND(?otherId__id AS ?otherId__dataProviderUrl)
      FILTER(isIRI(?otherId__id))
    }
`

const laureatePortaitSparqlQuery = `
  {
    SELECT ?id 
           ?wd_id 
           ?laureateImage__url 
           (STR(?laureateImage) as ?laureateImage__id)
           ?laureateImage__source__id
           ?laureateImage__source__dataProviderUrl
           ?laureateImage__source__prefLabel
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P31 <http://www.wikidata.org/entity/Q5> ; ## Q5 ir Wikidata ID, kas apzīmē personu (Human).
            wdt:P18 ?laureateImage .

      BIND(CONCAT("https://commons.wikimedia.org/w/thumb.php?f=",
              REPLACE(STR(?laureateImage), "^.+/(.+)$", "$1"),
              "&w=300") AS ?laureateImage__url)

      BIND(<https://www.wikidata.org> AS ?laureateImage__source__id)
      BIND(?laureateImage__source__id AS ?laureateImage__source__dataProviderUrl)
      BIND("Wikidata" as ?laureateImage__source__prefLabel)
    }
  }
`

export const laureateEntityWikiDataQuery = [{
  sparqlQuery: `
  SELECT * {
    ${laureatePortaitSparqlQuery}
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wikiPediaUrl__id sdo:about ?wd_id ;
                        sdo:isPartOf <https://en.wikipedia.org/>
      BIND(STR(?wikiPediaUrl__id) as ?wikiPediaUrl__prefLabel)
      BIND(?wikiPediaUrl__id as ?wikiPediaUrl__dataProviderUrl)

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?wikiPediaUrl__source__id)
      BIND(?wikiPediaUrl__source__id AS ?wikiPediaUrl__source__dataProviderUrl)
      BIND("Wikidata" as ?wikiPediaUrl__source__prefLabel)
    }
    UNION 
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P512 ?academicDegree__id .
      ?academicDegree__id rdfs:label ?academicDegree__prefLabel . 
      FILTER(LANG(?academicDegree__prefLabel) = "en")

       ## Add source information
      BIND(<https://www.wikidata.org> AS ?academicDegree__source__id)
      BIND(?academicDegree__source__id AS ?academicDegree__source__dataProviderUrl)
      BIND("Wikidata" as ?academicDegree__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P1451 ?organizationMotto__id .
      BIND(STR(?organizationMotto__id) AS ?organizationMotto__prefLabel)
      FILTER(LANG(?organizationMotto__id) = "en")

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?organizationMotto__source__id)
      BIND(?organizationMotto__source__id AS ?organizationMotto__source__dataProviderUrl)
      BIND("Wikidata" as ?organizationMotto__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }
      
      ?wd_id wdt:P166 ?otherAwards__id .
      ?otherAwards__id wdt:P279 ?superclass ;
                       rdfs:label ?otherAwards__prefLabel .
      
      BIND(?otherAwards__id as ?otherAwards__dataProviderUrl)
      # Nobel prizes (wd:Q7191) are listed in a separate field, so we exclude them.
      FILTER(?superclass != wd:Q7191 && LANG(?otherAwards__prefLabel) = "en")

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?otherAwards__source__id)
      BIND(?otherAwards__source__id AS ?otherAwards__source__dataProviderUrl)
      BIND("Wikidata" as ?otherAwards__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P800 ?notableWorks__id .
      ?notableWorks__id rdfs:label ?notableWorksLabel .
      ?notableWorks__id sdo:description ?notableWorksDescription .
      
      BIND(?notableWorks__id as ?notableWorks__dataProviderUrl)
      BIND(CONCAT(?notableWorksLabel, " - ", ?notableWorksDescription) as ?notableWorks__prefLabel) 
      FILTER(LANG(?notableWorksLabel) = "en" && LANG(?notableWorksDescription) = "en")

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?notableWorks__source__id)
      BIND(?notableWorks__source__id AS ?notableWorks__source__dataProviderUrl)
      BIND("Wikidata" as ?notableWorks__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P106 ?occupation__id .
      ?occupation__id rdfs:label ?occupation__prefLabel .
      FILTER(LANG(?occupation__prefLabel) = "en")

       # Add source information
      BIND(<https://www.wikidata.org> AS ?occupation__source__id)
      BIND(?occupation__source__id AS ?occupation__source__dataProviderUrl)
      BIND("Wikidata" as ?occupation__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }  
      ?wd_id wdt:P2611 ?tedSpeaker__id .
      
      # To build URL to corresponding TED speaker page then extract from TED speaker property entity the formatter url property to embed the ted speaker id into the URL.
      wd:P2611 wdt:P1630 ?urlTemplate .
      BIND(STR(?tedSpeaker__id) as ?tedSpeaker__prefLabel)
      BIND(REPLACE(?urlTemplate, "\\\\$1", STR(?tedSpeaker__id)) as ?tedSpeaker__dataProviderUrl)

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?tedSpeaker__source__id)
      BIND(?tedSpeaker__source__id AS ?tedSpeaker__source__dataProviderUrl)
      BIND("Wikidata" as ?tedSpeaker__source__prefLabel)
    }
    UNION
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }  
	    ?wd_id wdt:P10283 ?openAlex__id .
    
      wd:P10283 wdt:P1630 ?urlTemplate2 .
      BIND(STR(?openAlex__id) as ?openAlex__prefLabel)
      BIND(REPLACE(?urlTemplate2, "\\\\$1", STR(?openAlex__id)) as ?openAlex__dataProviderUrl)

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?openAlex__source__id)
      BIND(?openAlex__source__id AS ?openAlex__source__dataProviderUrl)
      BIND("Wikidata" as ?openAlex__source__prefLabel)
    }
    UNION 
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }

      ?wd_id wdt:P1412 ?knownLanguages__id .
      ?knownLanguages__id rdfs:label ?knownLanguages__prefLabel
      
      FILTER(LANG(?knownLanguages__prefLabel) = "en")

      ## Add source information
      BIND(<https://www.wikidata.org> AS ?knownLanguages__source__id)
      BIND(?knownLanguages__source__id AS ?knownLanguages__source__dataProviderUrl)
      BIND("Wikidata" as ?knownLanguages__source__prefLabel)
    }
    UNION 
    {
      VALUES (?id ?wd_id) { <ID_RELATED_SET> }
      ?wd_id wdt:P2456 ?dblp__id .
    
      wd:P2456 wdt:P1921 ?dblp_resource_url_template .
      BIND(REPLACE(?dblp_resource_url_template, "\\\\$1", STR(?dblp__id)) as ?laureate_dblp_id)
    }
  }
  `,
  dataSet: 'wikidata',
  templateFillerConfig: { relatedProperty: "wd_id", skipWithNoData: true }
},
{
  sparqlQuery: `
  SELECT ?id 
         ?dblp_creator_id 
         ?publication__id 
         ?publication__prefLabel 
         ?publication__dataProviderUrl
         ?publication__source__id
         ?publication__source__dataProviderUrl
         ?publication__source__prefLabel
  {
    VALUES (?id ?dblp_creator_id) { <ID_RELATED_SET> }  

    ?dblp_creator_id ^dblp:createdBy ?publication__id .
    ?publication__id rdfs:label ?publ_label .
    
    OPTIONAL {
      ?publication__id rdfs:label ?publ_label_en .
      FILTER(LANG(?publ_label_en) = "en")
    }

    BIND(COALESCE(?publ_label_en, ?publ_label) as ?publicationLabel)
    BIND(?publication__id AS ?publication__dataProviderUrl)

    BIND(<https://dblp.org/> AS ?publication__source__id)
    BIND(?publication__source__id AS ?publication__source__dataProviderUrl)
    BIND("DBLP - Computer Science bibliography" as ?publication__source__prefLabel)

    OPTIONAL {
      select ?publication__id (count(?citation) as ?citationCountComp) {
        VALUES (?id ?dblp_creator_id) { <ID_RELATED_SET> } 	 
        
        ?publication__id  dblp:createdBy  ?dblp_creator_id .
        ?publication__id  dblp:omid ?omid .
        ?citation rdf:type cito:Citation .
          ?citation cito:hasCitedEntity ?omid .
        }
        GROUP BY ?publication__id
    }
    BIND(COALESCE(?citationCountComp, 0) as ?publication__citationCount)
    BIND(IF(?publication__citationCount = 0, ?publicationLabel, CONCAT(?publicationLabel, ": (", STR(?publication__citationCount), " citations)")) as ?publication__prefLabel)
  }
  ORDER BY desc(?publication__citationCount)
  LIMIT 10
`,
  dataSet: 'dblp',
  templateFillerConfig: { relatedProperty: "laureate_dblp_id", skipWithNoData: true} 
}]


export const laureateWikiDataQuery = [
  {
    sparqlQuery: `SELECT * ${laureatePortaitSparqlQuery}`,
    dataSet: 'wikidata',
    templateFillerConfig: { relatedProperty: "wd_id", skipWithNoData: true}
  }
];

export const laureatesByBirthCountryQuery = `
    SELECT ?prefLabel 
           ?instanceCount
		       ?category
           {
            SELECT ?category ?prefLabel (count(distinct ?id) as ?instanceCount) 
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
   ORDER BY asc(?category)
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
    # Only some laureates have the english tagged value, others have no language tags.  

    ?id foaf:name ?laureate_name_multi .
    # Try to retrieve the english version of the name only, if it exists.
    OPTIONAL { ?id foaf:name ?laureate_name_en
                FILTER(LANG(?laureate_name_en) = 'en') 
    }
    BIND(COALESCE(?laureate_name_en, ?laureate_name_multi) AS ?prefLabel)
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