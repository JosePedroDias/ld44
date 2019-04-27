# ld44

[Ludum Dare 44](https://ldjam.com/events/ludum-dare/44) attempt.


## game idea

My main idea is to create a traffic simulation.
I want to present the player with scenarios with roads and traffic lights and make it so that an objective must be met and it requires the player to mess with the state of things.

The most obvious example I can envision is you changing the traffic lights so an ambulance arrives to the hospital on time...

This requires basic collision detection (between the cars), parameterized roads for rendering the scene and waypoint generation. Cars should behave as basic agents.

I like this project as it allows me to chase some gamedev topics I wanted to experiment with, namely roads creation, multi-agent systems and the developing a god-mode kind of game.

I'm well aware that implementing these features will probably limit my ability to spend much time in content and gameplay, but who knows... It's fun and that's the main goal.


## play the game

[RUN THE GAME IN THE BROWSER](https://josepedrodias.github.io/ld44/dist/index.html)

For now, you can control a car.  
Use the arrow keys to move it.


## the plan

    [x] integrate collision detection / basic physics (matter.js)
    [x] render using SVG (svg.js)
    [x] create road segments
    [x] generate waypoints from road segments
    [ ] make bots drive based on waypoints
    [ ] make bots have goal destinations (to turn and whatnot)
    [ ] create traffic lights
    [ ] different bot behaviour, maybe 
    [ ] procgen cars, maybe
    [ ] script some scenarios


## twitter thread

You can follow the development here on GitHub or in my ldjam thread on twitter:  
<https://twitter.com/jose_pedro_dias/status/1121963823001427968>