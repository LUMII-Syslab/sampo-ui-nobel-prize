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
    OPTIONAL {?id dbo:country ?country__id .
                          ?country__id rdfs:label ?countryLabel ;
                          # Retrieve the url to the dbo:Country in publicly available data provider.
                                          owl:sameAs ?country__dataProviderUrl .
                          BIND(STR(?countryLabel) AS ?country__prefLabel)
                          FILTER(LANG(?countryLabel) = 'en')
    }                          
    OPTIONAL {?id dbo:city ?city__id .
                      ?city__id rdfs:label ?cityLabel ;
                      # Retrieve the url to the dbo:city publicly available data provider.
                                      owl:sameAs ?city__dataProviderUrl .
                      BIND(STR(?cityLabel) AS ?city__prefLabel)
                      FILTER(LANG(?cityLabel) = 'en')              
    }        
`

export const eventPlacesQuery = `
  SELECT ?id ?lat ?long
  (COUNT(DISTINCT ?event) as ?instanceCount)
  WHERE {
    <FILTER>
    VALUES ?eventType { crm:E10_Transfer_of_Custody crm:E12_Production mmm-schema:ManuscriptActivity }
    ?event crm:P7_took_place_at ?id ;
           a ?eventType .
    ?id wgs84:lat ?lat ;
        wgs84:long ?long .
  }
  GROUP BY ?id ?lat ?long
`

export const eventsByTimePeriodQuery = `
  SELECT ?id ?type__id ?type__prefLabel
  (COUNT(DISTINCT ?event) as ?type__instanceCount)
  WHERE {
    <FILTER>
    <TIME_PERIODS>
  }
  GROUP BY ?id ?type__id ?type__prefLabel
  ORDER BY ?id
`

export const eventsByTimePeriodQuery2 = `
  SELECT ?id ?prefLabel ?period ?instanceCount
  WHERE {
    <FILTER>
    <TIME_PERIODS>
  }
`

export const placePropertiesInfoWindow = `
    ?id skos:prefLabel ?prefLabel__id .
    BIND(?prefLabel__id AS ?prefLabel__prefLabel)
    BIND(CONCAT("/places/page/", REPLACE(STR(?id), "^.*\\\\/(.+)", "$1")) AS ?prefLabel__dataProviderUrl)
`
