import { get, has } from "lodash"


export const fillIDSets = (resultSet, sparqlTemplate, config) => {
    config = config || {};

    let ids = resultSet.filter(e => !!e.id).map((e) => `<${get(e, "id.value", e.id)}>`);
    let idsRelated = config.relatedProperty ? resultSet.filter((e) => !!e[config.relatedProperty])
                                              .map((e) => `(<${get(e, "id.value", e.id)}> <${get(e, `${config.relatedProperty}.value`, e[config.relatedProperty])}>)`)
                                            : [];
    if (!config.keepDuplicates){
        ids = ids.filter((id, idx, arr) => idx === arr.indexOf(id));
        idsRelated = idsRelated.filter((idRelatedPair, idx, arr) => idx === arr.indexOf(idRelatedPair));
    }

    // Return null, so that the query is not executed, if there are no ids or idsRelated and the query has option set to skip query if no data.
    if (!!config.skipWithNoData && (idsRelated.length == 0 || ids.length == 0))
        return null;

    let query = sparqlTemplate
    query = query.replace(/<ID_SET>/g, ids.length == 0 ? '<http://ldf.fi/MISSING_VALUE>' : ids.join(" "));
    query = query.replace(/<ID_RELATED_SET>/g, idsRelated.length == 0 ? "(<http://ldf.fi/MISSING_VALUE> <http://ldf.fi/MISSING_VALUE>)" : idsRelated.join(" "));

    return query;
}