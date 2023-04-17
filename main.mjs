(async () => {

    let forwardTrie = null;
    let backwardTrie = null;
    let providedName = null;

    function loadWords() {
        return fetch("newWords.txt")
            .then(result => result.text())
    }

    function addToTrie(trie, word) {
        let node = trie;
        for (const c of word) {
            if (!node[c]) {
                node[c] = {}
            }

            node = node[c];
        }
        node[WORD_END] = true; // Mark end of word
    }


    function addReverseToTrie(trie, word) {
        let node = trie;
        let p = word.length;

        while (p--) {
            const c = word[p];
            if (!node[c]) {
                node[c] = {}
            }

            node = node[c];
        }
        node[WORD_END] = true; // Mark end of word
    }

    function makeTrie(words) {
        const trie = {};
        words.forEach(w => addToTrie(trie, w.toLowerCase()));

        return trie;
    }

    function makeReverseTrie(words) {
        const trie = {};
        words.forEach(w => addReverseToTrie(trie, w.toLowerCase()));
        return trie;
    }

    function findWordsBeginningWith(trie, sub) {
        const words = [];

        let node = trie;
        for (const c of sub.toLowerCase()) {

            node = node[c];

            if (!node) {
                return [];
            }
        }

        function walk(node, word) {
            if (node.hasOwnProperty(WORD_END)) {
                words.push(sub + word);
            }

            for (const c in node) {
                if (c !== WORD_END) {
                    walk(node[c], word + c);
                }
            }
        }

        walk(node, "");
        return words;
    }


    function getWordSplits(word, minLength = 2) {
        const splits = [];
        for (let i = minLength; i <= word.length - minLength; i++) {
            splits.push([
                word.substring(0, i),
                word.substring(i)
            ])
        }

        return splits;
    }

    function removeStartingWith(words, start) {
        const r = new RegExp("^" + start);
        return words.filter(w => {
            return !w.match(r)
        })
    }



    /***************** UI ******************/

    const FIRST_LIST_ID = "firstPart";
    const SECOND_LIST_ID = "secondPart";
    const RESULT_ID = "result";
    const WORD_END = "#";

    const selectedItems = [null, null];
    const wordParts = [null, null];
    let secondList = null;


    function clearList(id) {
        const sel = document.getElementById(id);

        if (!sel) {
            return;
        }
        sel.innerHTML = null;
    }

    function updateResult() {
        const re = document.getElementById(RESULT_ID);
        if (!re) {
            return;
        }
        if (!providedName) {
            re.innerText = "&hellip;";
        } if (wordParts[0] === null && wordParts[1] === null) {
            re.innerHTML = "&hellip;";
        } else {
            re.innerHTML = wordParts.map(m => m || "&hellip;").join("").replace(providedName, `<strong>${providedName}</strong>`);
        }
    }

    function fillSecondList(words) {
        if (secondList === words) {
            return;
        }

        secondList = words;

        wordParts[1] = null;

        const sel = document.getElementById(SECOND_LIST_ID);

        if (!sel) {
            return;
        }

        sel.innerHTML = null;

        words.forEach(w => {
            const opt = document.createElement("li");
            opt.innerText = w
            sel.appendChild(opt);

            opt.onclick = () => {
                if (selectedItems[1]) {
                    selectedItems[1].classList.remove("selected");
                }
                selectedItems[1] = opt;
                opt.classList.add("selected");
                wordParts[1] = w;
                updateResult();
            }

        })

    }

    function fillFirstList(words, otherWords) {
        const sel = document.getElementById(FIRST_LIST_ID);

        if (!sel) {
            return;
        }

        words.forEach(w => {
            const opt = document.createElement("li");
            opt.innerText = w
            sel.appendChild(opt);

            opt.onclick = () => {
                if (selectedItems[0]) {
                    selectedItems[0].classList.remove("selected");
                }
                selectedItems[0] = opt;
                opt.classList.add("selected");
                wordParts[0] = w;
                fillSecondList(otherWords);
                updateResult();
            }

        })

    }

    function update() {
        selectedItems[0] = null;
        selectedItems[1] = null;
        wordParts[0] = null;
        wordParts[1] = null;

        clearList(FIRST_LIST_ID);
        clearList(SECOND_LIST_ID);

        const splits = getWordSplits(providedName, 2);

        let combos = []
        for (const s of splits) {
            let firstHits = findWordsBeginningWith(backwardTrie, s[0].split("").reverse().join(""))
            let lastHits = findWordsBeginningWith(forwardTrie, s[1]);
            if (lastHits.length) {
                combos.push([firstHits.map(w => w.split("").reverse().join("")), lastHits]);
            }
        }

        combos.forEach(c => {
            fillFirstList(c[0].sort(), c[1]);
        })
    }


    function nameChanged(event) {
        providedName = event.target.value.toLowerCase();
        update();
        updateResult();
    }

    async function main() {
        const wordsList = await loadWords();

        const words = wordsList.split("\n").filter(w => {
            return w.length && w[0].toUpperCase() === w[0];
        });

        forwardTrie = makeTrie(words);
        backwardTrie = makeReverseTrie(words);

        document.getElementById("name").oninput = nameChanged;
    }

    document.body.onload = () => {
        main();
    }
})()