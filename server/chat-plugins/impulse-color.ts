export const UsernameColorPlugin = {
	colorCache: {} as Record<ID, string>,

	usernameColor(name: ID) {
		if (this.colorCache[name]) return this.colorCache[name];
		let hash;
		if (Config.customcolors?.[name]) {
			hash = MD5(Config.customcolors[name]);
		} else {
			hash = MD5(name);
		}
		let H = parseInt(hash.substr(4, 4), 16) % 360;
		let S = parseInt(hash.substr(0, 4), 16) % 50 + 40;
		let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30);

		let { R, G, B } = this.HSLToRGB(H, S, L);
		let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722;
		let HLmod = (lum - 0.2) * -150;
		if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
		else if (HLmod < 0) HLmod /= 3;
		else HLmod = 0;
		let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
		if (Hdist < 15) {
			HLmod += (15 - Hdist) / 3;
		}

		L += HLmod;
		let { R: r, G: g, B: b } = this.HSLToRGB(H, S, L);
		const toHex = (x: number) => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		this.colorCache[name] = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
		return this.colorCache[name];
	},

	HSLToRGB(H: number, S: number, L: number) {
		let C = ((100 - Math.abs(2 * L - 100)) * S) / 10000;
		let X = C * (1 - Math.abs((H / 60) % 2 - 1));
		let m = L / 100 - C / 2;
		let R1 = 0, G1 = 0, B1 = 0;

		switch (Math.floor(H / 60)) {
			case 0: R1 = C; G1 = X; break;
			case 1: R1 = X; G1 = C; break;
			case 2: G1 = C; B1 = X; break;
			case 3: G1 = X; B1 = C; break;
			case 4: R1 = X; B1 = C; break;
			case 5: R1 = C; B1 = X; break;
		}

		return { R: R1 + m, G: G1 + m, B: B1 + m };
	},
};

export const commands: ChatCommands = {
	colorname(target, room, user) {
		if (!target) return this.errorReply("Usage: /colorname [username]");
		const color = UsernameColorPlugin.usernameColor(toID(target));
		return this.sendReplyBox(`<strong style="color:${color}">${target}</strong>: ${color}`);
	},
};
