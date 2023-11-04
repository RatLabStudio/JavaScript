let markdown = [
    {
        tags: ["#####"],
        isVoid: true,
        style: ["<span class='h5'>", "</span>"]
    },
    {
        tags: ["####"],
        isVoid: true,
        style: ["<span class='h4'>", "</span>"]
    },
    {
        tags: ["###"],
        isVoid: true,
        style: ["<span class='h3'>", "</span>"]
    },
    {
        tags: ["##"],
        isVoid: true,
        style: ["<span class='h2' style='margin-bottom: 20px;'>", "</span>"]
    },
    {
        tags: ["#"],
        isVoid: true,
        style: ["<span class='h1'>", "</span><br><br>"]
    },
    {
        tags: ["- "],
        isVoid: true,
        style: ["<li>", "</li>"]
    },
    {
        tags: ["***", "***"],
        isVoid: false,
        style: ["<span class='bold italic'>", "</span>"]
    },
    {
        tags: ["**", "**"],
        isVoid: false,
        style: ["<span class='bold'>", "</span>"]
    },
    {
        tags: ["*", "*"],
        isVoid: false,
        style: ["<span class='italic'>", "</span>"]
    },
    {
        tags: ["[[", "]]"],
        isVoid: false,
        style: ["<a href=''>", "</a>"]
    },
    {
        tags: ["](", ")"],
        isVoid: false,
        style: ["<a href=''>", "</a>"]
    }
];

// Return a string enclosed by a given tag, like *italic*
function findTaggedString(string, tags) {
    let tag = tags[0];
    if (string.indexOf(tag) < 0)
        return null;
    let temp = string.substring(string.indexOf(tag));
    let phrase = temp.substring(tag.length, temp.substring(tag.length).indexOf(tags[1]) + tag.length);
    return phrase;
}

function findVoidTaggedString(string, tag) {
    if (string.indexOf(tag) < 0)
        return null;
    let temp = string.substring(string.indexOf(tag));
    let end = temp.indexOf("<br>");
    if (end == -1)
        end = temp.length;
    let phrase = temp.substring(tag.length, end);
    return phrase;
}

function convertToMarkdown(rawText) {
    for (let i = 0; i < markdown.length; i++) {
        let tag = markdown[i].tags[0];
        let tags = markdown[i].tags;
        if (!markdown[i].isVoid) {
            while (rawText.indexOf(tag) > -1) {
                let taggedString = findTaggedString(rawText, tags);
                if (taggedString == null)
                    continue;
                rawText = rawText.replace(tags[0] + taggedString + tags[1], markdown[i].style[0] + taggedString + markdown[i].style[1]);
            }
        }
        else {
            while (rawText.indexOf(tag) > -1) {
                let taggedString = findVoidTaggedString(rawText, tag);
                rawText = rawText.replace(tag + taggedString, markdown[i].style[0] + taggedString + markdown[i].style[1]);
            }
        }
    }
    return rawText;
}