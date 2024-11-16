import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
        const {data, history,api} = await request.json()
        console.log(data);
        const genAI = new GoogleGenerativeAI(api);

        let model = genAI.getGenerativeModel({
            model: "gemini-exp-1114",
          });
        let prompt = `
        give a single question(have 4 options each) for given: ${data.test},
        Note: 
        1.provide you response in this format:
        "{
            \"question\":\" \",
            \"options\":[],
            \"correct option\":\" \"
            \"choosed option\":\"\",
            \"Explain\":\" \"
        }";2)Ensure the response is strictly in JSON format without any markdown, 'json', or backticks. Only output valid JSON. 3)You only have to give the question nothing else. 4) This response i.e "user" is my last after that is not avaliable. 5)choosed should be empty in starting. 6)In options, right answer should be random not only in first place, REMEBER THAT! 7) In Explain: must and compulsory provide information why correct option is correct(in brief) Mandatory`

          let result = await model.generateContent(prompt)
          console.log(result.response.text());
          
          const chat = model.startChat({history: history});
          const result1 = await chat.sendMessage(result.response.text())
          const AiResponse = result1.response.text();

        return new Response(JSON.stringify({AiResponse}),{
          headers: { 'Content-Type': 'application/json' },
        })
        
    }
    catch(error) {
      console.error('Error processing request:', error);
      return new Response(JSON.stringify({ error: 'Failed to process the request.' }), { status: 500 });
    }
}