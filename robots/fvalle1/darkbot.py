import random
from math import atan


def rotate_turret(args, enemy) -> dict:
    my_angle = args["angle"]
    if my_angle > enemy["angle"]:
        return {"move_forwards": 1, "turn_turret_left": (my_angle-enemy["angle"]) % 360}
    else:
        return {"move_forwards": 1, "turn_turret_right": (enemy["angle"]-my_angle) % 360}

def search_enemy(args, res):
    if "enemy" in args["data"]:
        res.append(rotate_turret(args, {"angle": args["data"]["enemy"]["angle"]}))
    else:
        res.append(rotate_turret(args, {"angle": random.randint(0, 90)}))

def move_away(args, res):
    res.append({"move_forwards": 250, "yell": "Ooops!"})
    res.append({"turn_left": random.randint(10, 180)})

def clear_data(res):
    res.append({"data":{}})

def main(args):
    res = []
    ev = args["event"] if "event" in args else ""
    if ev == "idle":
        res.append({"move_forwards": 50})
        res.append({"turn_right": random.randint(0, 180)})
        search_enemy(args, res)
    elif ev == "wall-collide":
        res.append({"move_opposide": 100})
        res.append({"turn_right": random.randint(10, 90)})
        search_enemy(args, res)
    elif ev == "hit":
        move_away(args, res)
    elif ev == "enemy-spot":
        enemy = args["enemy_spot"]
        res.append(rotate_turret(args, enemy))
        #distance = ((enemy["x"]-args["x"])**2+(enemy["y"]-args["y"])**2)**0.5
        for i in range(3):
            res.append({"move_forwards":0, "shoot": True})
        res.append({"data": {"enemy": enemy}, "yell": "Fire!"})
    else:
        print(args)
    return {"body": res}
