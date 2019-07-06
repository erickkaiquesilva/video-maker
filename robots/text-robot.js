const algorithmia = require('algorithmia')
const algorithmaApiKey = require('../credentials/credentials.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

   async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmaApiKey) // Inicializando uma autenticaçao na API
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2') // dentro do site eu busquei a api para o wikipedia
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm) // com o wikipediaAlgorithm eu tenho um metodo que eu passo algo para dentro do pipe que busca algo dentro do wikipedia
        const wikipediaContent = wikipediaResponse.get() // depois dentro do wikipediaResponse eu consigo usar um metodo get() que me retorna todos os valores e eu armazeno isto.
        
        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitizes = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitizes)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot