from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models import Post, User
from app.auth import get_password_hash

def create_user(session: Session, username: str = "testuser"):
    user = User(username=username, email=f"{username}@example.com", password_hash=get_password_hash("password"))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def create_post(session: Session, user_id: int):
    post = Post(title="Test Post", content="Test Content", user_id=user_id)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

def get_auth_headers(client: TestClient, username: str = "testuser", password: str = "password"):
    response = client.post("/token", data={"username": username, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_comment(client: TestClient, session: Session):
    user = create_user(session)
    post = create_post(session, user.id)
    headers = get_auth_headers(client)

    response = client.post(
        f"/posts/{post.id}/comments",
        json={"content": "This is a test comment"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "This is a test comment"
    assert data["username"] == user.username

def test_get_comments(client: TestClient, session: Session):
    user = create_user(session)
    post = create_post(session, user.id)
    headers = get_auth_headers(client)

    # Create a comment
    client.post(
        f"/posts/{post.id}/comments",
        json={"content": "First comment"},
        headers=headers
    )

    response = client.get(f"/posts/{post.id}/comments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["content"] == "First comment"

def test_delete_comment(client: TestClient, session: Session):
    user = create_user(session)
    post = create_post(session, user.id)
    headers = get_auth_headers(client)

    # Create a comment
    create_resp = client.post(
        f"/posts/{post.id}/comments",
        json={"content": "To be deleted"},
        headers=headers
    )
    comment_id = create_resp.json()["id"]

    # Delete it
    response = client.delete(f"/comments/{comment_id}", headers=headers)
    assert response.status_code == 204

    # Verify it's marked as deleted
    get_resp = client.get(f"/posts/{post.id}/comments")
    data = get_resp.json()
    assert data[0]["deleted"] is True
    assert data[0]["content"] == "[deleted]"
