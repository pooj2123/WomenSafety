import torch
import random
import pickle
import os
import torch.nn.functional as F

from env import GraphEnv
from dqn import DQN


# -----------------------------
# Load graph
# -----------------------------
GRAPH_PATH = "C:\\Users\\ppooj\\OneDrive\\Desktop\\WomenSafety\\backend\\app\\data\\graph_with_safety.pkl"

if not os.path.exists(GRAPH_PATH):
    raise FileNotFoundError(f"Graph file not found: {GRAPH_PATH}")

with open(GRAPH_PATH, "rb") as f:
    G = pickle.load(f)

print("Graph loaded successfully")


# -----------------------------
# Initialize environment + model
# -----------------------------
env = GraphEnv(G)
model = DQN(input_dim=4, output_dim=10)

optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

gamma = 0.99
epsilon = 1.0
epsilon_decay = 0.999
epsilon_min = 0.05

episodes = 1000
max_steps = 100

nodes = list(G.nodes)

print("Training started...\n")


# -----------------------------
# Training loop
# -----------------------------
for episode in range(episodes):

    start = random.choice(nodes)
    target = random.choice(nodes)

    while start == target:
        target = random.choice(nodes)

    state = env.reset(start, target)

    done = False
    total_reward = 0

    for step in range(max_steps):

        actions = env.get_actions(env.current)

        if not actions:
            break

        # Epsilon-greedy
        if random.random() < epsilon:
            action = random.choice(actions)
        else:
            state_tensor = torch.FloatTensor(state)

            with torch.no_grad():
                q_values = model(state_tensor)

            action_idx = min(
                len(actions) - 1,
                torch.argmax(q_values).item()
            )

            action = actions[action_idx]

        next_state, reward, done = env.step(action)

        total_reward += reward

        state_tensor = torch.FloatTensor(state)
        next_tensor = torch.FloatTensor(next_state)

        q_values = model(state_tensor)

        action_idx = actions.index(action)
        current_q = q_values[0][action_idx]

        with torch.no_grad():
            next_q_values = model(next_tensor)
            target_q = reward if done else reward + gamma * torch.max(next_q_values)

        loss = F.mse_loss(current_q, target_q)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        state = next_state

        if done:
            break

    epsilon = max(epsilon_min, epsilon * epsilon_decay)

    print(
        f"Episode {episode+1}/{episodes} | "
        f"Reward: {round(total_reward, 2)} | "
        f"Epsilon: {round(epsilon, 3)}"
    )


# -----------------------------
# Save model
# -----------------------------
MODEL_PATH = "C:\\Users\\ppooj\\OneDrive\\Desktop\\WomenSafety\\backend\\rl\\dqn_model.pth"

torch.save(model.state_dict(), MODEL_PATH)

print(f"\nTraining complete.")
print(f"Model saved at {MODEL_PATH}")