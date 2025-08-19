from flask import Flask, jsonify, request
from flask_cors import CORS
import speech_recognition as sr
import nltk

app = Flask(__name__)
CORS(app)

# Ensure you download the required NLTK data if not done already
nltk.download('punkt', quiet=True)  # Download tokenizer data quietly

@app.route('/api', methods=['GET'])
def index():
    return jsonify({"message": "Hello from the backend!"})

@app.route('/api/recognize', methods=['POST'])
def recognize_speech():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
            recognized_text = recognizer.recognize_google(audio)
            return jsonify({'text': recognized_text}), 200
    except sr.UnknownValueError:
        return jsonify({'error': 'Could not understand audio'}), 400
    except sr.RequestError as e:
        app.logger.error(f"Request error: {e}")  # Log the error
        return jsonify({'error': 'Could not request results from Google Speech Recognition service'}), 500
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")  # Catch-all for debugging
        return jsonify({'error': 'An internal error occurred'}), 500

@app.route('/api/tokenize', methods=['POST'])
def tokenize_text():
    data = request.get_json()
    text = data.get('text', '')
    tokens = nltk.word_tokenize(text)
    return jsonify({'tokens': tokens}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)