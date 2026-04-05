import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

def reset_index():
    load_dotenv()
    
    api_key = os.environ.get("VECTOR_DB_API_KEY") or os.environ.get("PINECONE_API_KEY")
    index_name = os.environ.get("PINECONE_INDEX_NAME")
    
    if not api_key or not index_name:
        print("Error: Pinecone API Key or Index Name not found in environment.")
        return

    pc = Pinecone(api_key=api_key)
    
    # Delete if exists
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if index_name in existing_indexes:
        print(f"Deleting existing index: {index_name}...")
        pc.delete_index(index_name)
        
    print(f"Creating new index: {index_name} with dimension 384...")
    pc.create_index(
        name=index_name,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    print("Pinecone index recreated successfully.")

if __name__ == "__main__":
    reset_index()
