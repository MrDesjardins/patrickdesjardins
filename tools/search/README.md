# Prerequisites

Install the Python Environment (Python version) and Virtual Environment (dependencies)

```sh
brew install pyenv-virtualenv
```

Add in ~/.zshrc for auto-switching

```sh
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)"
```

Update terminal

```sh
source ~/.zshrc
```

Install version of Python

```sh
pyenv install 3.10.13
pyenv virtualenv 3.10.13 venv
pyenv local venv

```

# Install Dependencies

```sh
pip install -r requirements.txt
```

# Installing Dependencies for the Search Tool

```sh
pip freeze > requirements.txt
```

# Run the Search Tool

```sh
python3 main.py generate
```
