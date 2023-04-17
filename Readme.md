magnamechanika
==============

Funny things with words and names - using german words. 

Enter a name and it tries to find a compound word that ends with the first part of the name and starts with the rest of 
the name, like Werner -> Ing-werner-z.

It sets up two trie structures with all words from the `detusch.txt` files (using only words starting with a caputal letter).
The one of the trie structures is filled with all words reversed so we can easily find words ending with a given character sequence.

It then splits the given name at different positions leaving at least 2 characters in the first and the second part and
searches the tries for words starting/ending with the two resulting parts fo the name.

## Creating the wordlist

Download https://github.com/gambolputty/german-nouns/blob/main/german_nouns/nouns.csv and run `converter.js`