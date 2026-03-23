from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA

class RagService:
    def __init__(self):
        self.embedding = OpenAIEmbeddings()

        self.db = Chroma(
            persist_directory="./db",
            embedding_function=self.embedding
        )

        self.qa = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4o-mini"),
            retriever=self.db.as_retriever()
        )

    def ask(self, query: str):
        return self.qa.run(query)