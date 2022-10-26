const levenshtein = require('js-levenshtein');
const LEV_DIST = 1;

module.exports = async function searchList(list, search, demons = false) {
    var target = list.find(item => item.name.toLowerCase() == search);

    //If no direct match
    if(target == undefined) {
        target = list.find(item => item.names[0] && item.names.some(n => n.toLowerCase() == search));

        //If no nickname match
        if(target == undefined) {
            //Look for similar words w/ levenshtein dist.
            let similar = [];
            for(let item of list) {
                let levDist = levenshtein(item.name.toLowerCase(), search);
                if(levDist <= LEV_DIST) similar.push(item.name);
            }

            //If no similar words are found
            if(similar.length == 0) {
                //Look for words that start or end w/ the query
                let startsWith = [];
                let endsWith = [];
                for(let item of list) {
                    if(item.name.toLowerCase().startsWith(search)) startsWith.push(item.name);
                    if(item.name.toLowerCase().endsWith(search)) endsWith.push(item.name);
                }
                const partial = [...startsWith, ...endsWith];

                if(partial.length == 1) {
                    target = list.find(item => item.name.toLowerCase() == partial[0].toLowerCase());
                } else if(partial.length > 1) {
                    return `Could not find '${search}'. Did you mean: ${partial.join(", ")}?`;
                } else {
                    return `Could not find '${search}'.`
                }
            } else if(similar.length == 1) {
                target = list.find(item => item.name.toLowerCase() == similar[0].toLowerCase());
            } else {
                return `Could not find '${search}'. Did you mean: ${similar.join(", ")}?`;
            }
        }
    }

    //For skills as they need the list of demons
    if(demons) return {embeds: [await target.writeToDiscord(demons)]};
    return {embeds: [await target.writeToDiscord()]};
} 