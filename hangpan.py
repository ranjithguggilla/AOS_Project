import random
word_list = ["apple", "bannana", "mango"]
random = random.choice(word_list)
print("Guess the word: ", end=" ")

placeholder = ""
word_len = len(random)
for i in range(word_len):
    placeholder += "_"
print(placeholder)
g = False
store = []

graphic = [
        """
            +-------+
            |
            |
            | 
            |
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            | 
            |
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            |       |
            |
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            |      -|
            |
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            |      -|-
            |
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            |      -|-
            |      /
            |
         ==============
        """
            ,
        """
            +-------+
            |       |
            |       0
            |      -|-
            |      / |
            |
         ==============
        """]


while not g:

    user_input = input("Guess a letter:")
    display = ""
    count = -1
    for char in random:
        if char == user_input:
            display += char
            store.append(user_input)
        elif char in store:
            display += char
        else:
            display += "_"
    print(display)
    if user_input in list:
        count += 1
        print(graphic[count])
    else:
        print(graphic[count])
         
    if "_" not in display:
        g = True
        print("You Win.")
