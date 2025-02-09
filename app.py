from flask import Flask
import requests
import json



# Replace with your actual API key and external user ID
api_key = 'mGJSgLnE5VMqazBP2jCoqSJwTESBO0fL'
external_user_id = 'simon'

# Step 1: Create Chat Session
create_session_url = 'https://api.on-demand.io/chat/v1/sessions'
create_session_headers = {
    'apikey': api_key
}
create_session_body = {
    "pluginIds": [],
    "externalUserId": external_user_id
}

# Make the request to create a chat session
response = requests.post(create_session_url, headers=create_session_headers, json=create_session_body)
response_data = response.json()

# Extract the session ID from the response
session_id = response_data['data']['id']



url = "https://api.on-demand.io/media/v1/public/file"

payload = {
    "sessionId": f"{session_id}",
    "externalUserId": f"{external_user_id}",
    "url": "https://lh3.googleusercontent.com/pw/AP1GczNCd4z5a3rWt5EHnMrX50g5PDl9QwirCJIOlDvZOr4wCFT_I3sOR3PA8EJcD48Qdj4hRu5qslKRg7stcwgYvBCUOuRB1oz8qRwa84sDT3gKy9qv74l5xCnQnIekCj-_5HxH3q4gM098jXBmvU-SSeQEdg=w1441-h1081-s-no-gm?authuser=0",
    "name": "meal",
    "plugins": ["plugin-1713958591"],
    "responseMode": "sync",
    "pluginInputs": [{ "additionalProp": { "postProcess": { "chatPluginId": "plugin-1716472791" } } }]
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "apikey": "mGJSgLnE5VMqazBP2jCoqSJwTESBO0fL"
}

response = requests.post(url, json=payload, headers=headers)
r1 = response.text
print(response.text)

# Now IMAGE IS IN CONTEXT

# Step 2: Submit Query
submit_query_url = f'https://api.on-demand.io/chat/v1/sessions/{session_id}/query'
submit_query_headers = {
    'apikey': api_key
}


submit_query_body = {
    "endpointId": "predefined-openai-gpt4o",
    "query": "Output ONLY a json file containing your best estimate of the nutrition content of this meal with 'calories', 'protein', 'carbs', and 'fat' as your keys and numerical values. No units. Thanks. No newlines and do NOT say 'json' at the beginning. It is critical that your output is proper JSON.",
    "pluginIds": ["plugin-1712327325", "plugin-1713962163"],
    "responseMode": "sync"
}
query_response = requests.post(submit_query_url, headers=submit_query_headers, json=submit_query_body)
query_response_data = query_response.json()
healthJSON = str(query_response_data)
print(query_response_data)
j = json.loads(query_response_data['data']['answer'])


# based on this previous meal, what macronutrients should I try to eat for lunch
# Step 2: Submit Query
submit_query_url = f'https://api.on-demand.io/chat/v1/sessions/{session_id}/query'
submit_query_headers = {
    'apikey': api_key
}

context = r1 + "\n" + healthJSON
submit_query_body = {
    "endpointId": "predefined-openai-gpt4o",
    "query": f"CONTEXT: {context} . PROMPT: Based on your best estimate of the nutrient information in the image, please advise me on how healthy my meal is. Be VERY concise and do not say anything like - it's challenging to provide specific advice -. If I'm eating well, congratulate me. If I'm not, suggest how I can eat healthier in the future.",
    "pluginIds": ["plugin-1712327325", "plugin-1713962163"],
    "responseMode": "sync"
}

# Make the request to submit a query
query_response = requests.post(submit_query_url, headers=submit_query_headers, json=submit_query_body)
query_response_data = query_response.json()
healthyTip = query_response_data["data"]["answer"]
print(healthyTip)
# Print the response from the query submission
# print(query_response_data)



streak = 6
app = Flask(__name__)

@app.route('/info')
def home():
    global streak
    global healthyTip
    streakInfo = {"current_streak": streak, "longest_streak": 56, "total_uploads": 105, "last_upload": "Today", "healthy_tip": healthyTip}
    streak = streak + 1
    return streakInfo | j

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
