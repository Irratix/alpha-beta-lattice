const cell_width = 10;

const draw_centers = function (lattice, c, ctx) {
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            ctx.fillStyle = lattice[16 * j + i] !== -1 ? "green" : "maroon";
            ctx.beginPath();
            ctx.arc(
                (i + 0.5) * cell_width,
                (j + 0.5) * cell_width,
                cell_width / 4,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }
}

const draw_arms = function (lattice, c, ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = cell_width / 16;
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const num = lattice[i + 16 * j];
            if (num === -1) continue;
            for (let k = 0; k < 8; k++) {
                ctx.beginPath();
                ctx.moveTo((i + 0.5) * cell_width, (j + 0.5) * cell_width);
                if ((num >> k) & 1) {
                    switch (k) {
                        case 0:
                            ctx.lineTo((i + 1) * cell_width, j * cell_width);
                            break;
                        case 1:
                            ctx.lineTo((i + 1) * cell_width, (j + 0.5) * cell_width);
                            break;
                        case 2:
                            ctx.lineTo((i + 1) * cell_width, (j + 1) * cell_width);
                            break;
                        case 3:
                            ctx.lineTo((i + 0.5) * cell_width, (j + 1) * cell_width);
                            break;
                        case 4:
                            ctx.lineTo(i * cell_width, (j + 1) * cell_width);
                            break;
                        case 5:
                            ctx.lineTo(i * cell_width, (j + 0.5) * cell_width);
                            break;
                        case 6:
                            ctx.lineTo(i * cell_width, j * cell_width);
                            break;
                        case 7:
                            ctx.lineTo((i + 0.5) * cell_width, j * cell_width);
                            break;
                    }
                }
                ctx.stroke();
            }
        }
    }
}

const draw_numbers = function (lattice, c, ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "15px sanserif";
    ctx.textAlign = "center";
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            let number = lattice[i + j * 16];
            if (number !== -1)
                ctx.strokeText(number, (i + 0.5) * cell_width, (j + 0.6) * cell_width);
        }
    }
}

export const draw_lattice = function (lattice, c, ctx) {
    if (!c) {
        c = document.createElement("canvas");
        c.width = cell_width * 16;
        c.height = cell_width * 16;
        ctx = c.getContext("2d");
    }
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);
    draw_arms(lattice, c, ctx);
    draw_centers(lattice, c, ctx);
    // draw_numbers(lattice, c, ctx);
    document.body.appendChild(c);
}

export const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));