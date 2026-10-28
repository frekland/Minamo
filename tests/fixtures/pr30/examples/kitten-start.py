"""TEST ONLY beginner starting point, intentionally one small branch."""

choice = input("Zombie cats approach. Will your kitten hide or run? ").strip().lower()

if choice == "hide":
    print("The AI mouse guides you behind a tea crate.")
elif choice == "run":
    print("You sprint toward the mouse-controlled tram.")
else:
    print("The AI mouse asks you to choose hide or run.")
