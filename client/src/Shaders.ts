import {defaultFilterVert, Filter} from "pixi.js";

//I'm trying to learn shaders since they are cool af but rn they are mostly black magic for me so this was made with quite a lot of AI help

export const pulseer = Filter.from({
    gl: {
        vertex: defaultFilterVert,
        fragment: `
            in vec2 vTextureCoord;
            out vec4 finalColor;
            uniform sampler2D uTexture;
            uniform float uTime;

            void main() {
                vec4 color = texture(uTexture, vTextureCoord);
                
                // Pulsing glow brightness based on sine wave:
                float glow = 0.8 + 0.3 * sin(uTime * 5.0);
                
                finalColor = vec4(color.rgb * glow, color.a);
            }
        `
    },
    resources: {
        timeUniforms: {
            uTime: { value: 0.0, type: "f32" }
        }
    }
});