// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, l, { is: u, defineProperty: d, getOwnPropertyDescriptor: ee, getOwnPropertyNames: te, getOwnPropertySymbols: ne, getPrototypeOf: re } = Object, f = globalThis, p = f.trustedTypes, ie = p ? p.emptyScript : "", ae = f.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, g = (e, t) => !u(e, t), _ = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
(l = Symbol).metadata ?? (l.metadata = Symbol("metadata")), f.litPropertyMetadata ?? (f.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ?? (this.l = [])).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = _) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && d(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = ee(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? _;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = re(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...te(e), ...ne(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ?? (n = a.getPropertyOptions(e)), !((n.hasChanged ?? g)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[m("elementProperties")] = /* @__PURE__ */ new Map(), v[m("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: v }), (f.reactiveElementVersions ?? (f.reactiveElementVersions = [])).push("2.1.2");
// node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, oe = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, w = "?" + C, se = `<${w}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, ce = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, j = /-->/g, M = />/g, N = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), P = /'/g, F = /"/g, I = /^(?:script|style|textarea|title)$/i, L = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), R = Symbol.for("lit-noChange"), z = Symbol.for("lit-nothing"), B = /* @__PURE__ */ new WeakMap(), V = T.createTreeWalker(T, 129);
function H(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var le = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = j : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = N) : (I.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = N) : o = M : o === N ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? N : c[3] === "\"" ? F : P) : o === F || o === P ? o = N : o === j || o === M ? o = A : (o = N, i = void 0);
		let d = o === N && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + oe + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [H(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, U = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = le(t, n);
		if (this.el = e.createElement(l, r), V.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = V.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(oe)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? de : r[1] === "?" ? fe : r[1] === "@" ? pe : K
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (I.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), V.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === w) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = T.createElement("template");
		return n.innerHTML = e, n;
	}
};
function W(e, t, n = e, r) {
	if (t === R) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ?? (n._$Co = []))[r] = i), i !== void 0 && (t = W(e, i._$AS(e, t.values), i, r)), t;
}
var ue = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? T).importNode(t, !0);
		V.currentNode = r;
		let i = V.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new G(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new me(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = V.nextNode(), a++);
		}
		return V.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, G = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = W(this, e, t), D(e) ? e === z || e == null || e === "" ? (this._$AH !== z && this._$AR(), this._$AH = z) : e !== this._$AH && e !== R && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== z && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = U.createElement(H(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ue(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = B.get(e.strings);
		return t === void 0 && B.set(e.strings, t = new U(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, K = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = z, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = z;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = W(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== R, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = W(this, r[n + o], t, o), s === R && (s = this._$AH[o]), a || (a = !D(s) || s !== this._$AH[o]), s === z ? e = z : e !== z && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, de = class extends K {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === z ? void 0 : e;
	}
}, fe = class extends K {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== z);
	}
}, pe = class extends K {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = W(this, e, t, 0) ?? z) === R) return;
		let n = this._$AH, r = e === z && n !== z || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== z && (n === z || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, me = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		W(this, e);
	}
}, he = y.litHtmlPolyfillSupport;
he?.(U, G), (y.litHtmlVersions ?? (y.litHtmlVersions = [])).push("3.3.3");
var ge = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new G(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, q = globalThis, J = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		var e;
		let t = super.createRenderRoot();
		return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ge(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return R;
	}
};
J._$litElement$ = !0, J.finalized = !0, q.litElementHydrateSupport?.({ LitElement: J });
var _e = q.litElementPolyfillSupport;
_e?.({ LitElement: J }), (q.litElementVersions ?? (q.litElementVersions = [])).push("4.2.2");
// \0@oxc-project+runtime@0.155.0/helpers/esm/typeof.js
function Y(e) {
	"@babel/helpers - typeof";
	return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Y(e);
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/toPrimitive.js
function ve(e, t) {
	if (Y(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Y(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/toPropertyKey.js
function ye(e) {
	var t = ve(e, "string");
	return Y(t) == "symbol" ? t : t + "";
}
// \0@oxc-project+runtime@0.155.0/helpers/esm/defineProperty.js
function X(e, t, n) {
	return (t = ye(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
// src/hockey-tracker-card.js
var Z = "1.12.1", be = !customElements.get("hockey-tracker-card");
function Q(e, t) {
	customElements.get(e) || customElements.define(e, t);
}
function xe(e, t) {
	if (!e) return "";
	let n = Object.keys(e.states).filter((e) => e.startsWith("sensor.")), r = (t) => e.entities?.[t] ? e.entities[t].platform === "hockey_tracker" : "team_name" in (e.states[t].attributes || {}) || "bracket" in (e.states[t].attributes || {});
	return n.find((n) => r(n) && "bracket" in (e.states[n].attributes || {}) === t) ?? "";
}
async function Se(e, t) {
	try {
		await e.callService("hockey_tracker", "force_refresh", { entity_id: t });
	} catch {
		try {
			await e.callService("homeassistant", "update_entity", { entity_id: t });
		} catch (e) {
			console.warn("[hockey-tracker-card] Refresh failed:", e);
		}
	}
}
Q("hockey-tracker-card-editor", class e extends J {
	static get properties() {
		return {
			hass: {},
			config: {}
		};
	}
	setConfig(e) {
		this.config = {
			show_logo: !0,
			show_shots: !0,
			show_next_game: !0,
			show_recent_games: !1,
			recent_games_count: 3,
			collapsible_recent: !0,
			auto_collapse_recent: !0,
			show_events: !1,
			events_count: 10,
			collapsible_events: !0,
			show_event_goals: !0,
			show_event_penalties: !0,
			show_event_shots: !0,
			logo_size: 64,
			show_last_updated: !0,
			...e
		};
	}
	static get _schema() {
		return [
			{
				name: "entity",
				required: !0,
				selector: { entity: { domain: "sensor" } }
			},
			{
				name: "title",
				selector: { text: {} }
			},
			{
				name: "show_logo",
				selector: { boolean: {} }
			},
			{
				name: "show_shots",
				selector: { boolean: {} }
			},
			{
				name: "show_next_game",
				selector: { boolean: {} }
			},
			{
				name: "show_last_updated",
				selector: { boolean: {} }
			},
			{
				name: "show_recent_games",
				selector: { boolean: {} }
			},
			{
				name: "recent_games_count",
				default: 3,
				selector: { number: {
					min: 1,
					max: 10,
					step: 1,
					mode: "box"
				} }
			},
			{
				name: "collapsible_recent",
				selector: { boolean: {} }
			},
			{
				name: "auto_collapse_recent",
				selector: { boolean: {} }
			},
			{
				name: "show_events",
				selector: { boolean: {} }
			},
			{
				name: "events_count",
				default: 10,
				selector: { number: {
					min: 3,
					max: 25,
					step: 1,
					mode: "box"
				} }
			},
			{
				name: "collapsible_events",
				selector: { boolean: {} }
			},
			{
				name: "show_event_goals",
				selector: { boolean: {} }
			},
			{
				name: "show_event_penalties",
				selector: { boolean: {} }
			},
			{
				name: "show_event_shots",
				selector: { boolean: {} }
			},
			{
				name: "logo_size",
				default: 64,
				selector: { number: {
					min: 24,
					max: 200,
					step: 4,
					mode: "slider"
				} }
			}
		];
	}
	_computeLabel(e) {
		return {
			entity: "Sensor Entity",
			title: "Card Title (leave blank to use team name)",
			show_logo: "Show team logos",
			show_shots: "Show shots on goal",
			show_next_game: "Show next game when no game is active",
			show_last_updated: "Show time since last data refresh",
			show_recent_games: "Show recent game results",
			recent_games_count: "Number of recent games to show (1–10, default: 3)",
			collapsible_recent: "Allow recent games section to be collapsed",
			auto_collapse_recent: "Auto-collapse recent games when a game goes live",
			show_events: "Show live game events (goals & penalties) during active games",
			events_count: "Number of events to display (3–25, default: 10)",
			collapsible_events: "Allow game events section to be collapsed",
			show_event_goals: "Show goal events in ticker",
			show_event_penalties: "Show penalty events in ticker",
			show_event_shots: "Show shot events in ticker (NHL only)",
			logo_size: "Logo size in px (24–200, default: 64)"
		}[e.name] ?? e.name;
	}
	_valueChanged(e) {
		e.stopPropagation(), this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e.detail.value } }));
	}
	render() {
		return !this.hass || !this.config ? L`` : L`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${e._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
	}
});
var $ = class extends J {
	constructor(...e) {
		super(...e), X(this, "_recentCollapsed", !1), X(this, "_eventsCollapsed", !1), X(this, "_prevLive", !1), X(this, "_showLastGame", !1), X(this, "_failedLogos", /* @__PURE__ */ new Set()), X(this, "_ageTimer", null);
	}
	static get properties() {
		return {
			hass: {},
			config: {}
		};
	}
	static get styles() {
		return o`
      :host { display: block; }

      /* ── Root content wrapper ────────────────────────── */
      .ht-content { padding: 14px 16px 12px; }

      /* ── Top bar ─────────────────────────────────────── */
      .ht-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
      }
      .ht-badge {
        padding: 3px 10px;
        border-radius: 99px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .ht-badge--live  { background: #d32f2f; color: #fff; }
      .ht-badge--pre   { background: #1565c0; color: #fff; }
      .ht-badge--final { background: var(--secondary-text-color); color: #fff; }
      .ht-badge--none  { background: var(--disabled-color, #9e9e9e); color: #fff; }
      .ht-title {
        flex: 1;
        text-align: center;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 8px;
      }
      .ht-refresh-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        margin-right: -4px;
      }
      .ht-history-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .ht-history-btn--active {
        color: var(--primary-color);
      }
      .ht-last-updated {
        text-align: right;
        font-size: 0.68rem;
        color: var(--disabled-color, #9e9e9e);
        margin-bottom: 8px;
        padding-right: 2px;
      }

      /* ── Scoreboard ─────────────────────────────────── */
      .ht-scoreboard {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 4px;
        padding: 8px 0 10px;
        border-top: 1px solid var(--divider-color);
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 8px;
      }
      .ht-team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }
      .ht-logo {
        object-fit: contain;
      }
      .ht-logo-icon {
        --mdc-icon-size: 48px;
        color: var(--primary-color);
      }
      .ht-team-name {
        font-size: 0.78rem;
        text-align: center;
        color: var(--secondary-text-color);
        line-height: 1.2;
        word-break: break-word;
      }
      .ht-score {
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }
      .ht-score-dash {
        font-size: 1.4rem;
        color: var(--secondary-text-color);
      }
      .ht-mid {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-self: stretch;
        gap: 4px;
        flex-shrink: 0;
      }
      .ht-at-sign {
        font-size: 1.1rem;
        color: var(--secondary-text-color);
        font-weight: 600;
      }

      /* ── Period / game info rows ─────────────────────── */
      .ht-last-game-label {
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }
      .ht-last-game-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px 0 12px;
      }
      .ht-last-game-empty-text {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .ht-last-game-load-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .ht-last-game-load-btn:hover { background: var(--primary-color); color: #fff; }
      .ht-last-game-load-btn ha-icon { --mdc-icon-size: 15px; }
      .ht-period, .ht-venue {
        text-align: center;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .ht-shots {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        padding: 0 2px;
        margin-bottom: 4px;
      }
      .ht-start-time {
        text-align: center;
        font-size: 0.9rem;
        color: var(--primary-text-color);
        font-weight: 500;
        margin-bottom: 4px;
      }

      /* ── Upcoming / next game ────────────────────────── */
      .ht-next-game {
        padding: 10px 0 4px;
        border-top: 1px solid var(--divider-color);
      }
      .ht-next-game-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .ht-next-game-teams {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .ht-next-game-team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        text-align: center;
      }
      .ht-next-game-at {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .ht-next-game-time {
        text-align: center;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .ht-next-game-venue {
        text-align: center;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      /* ── No game / off-season ────────────────────────── */
      .ht-no-games {
        border-top: 1px solid var(--divider-color);
        padding: 16px 0 8px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 0.88rem;
      }
      .ht-no-games-logo {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }

      /* ── Game events (goals & penalties) ───────────── */
      .ht-events {
        border-top: 1px solid var(--divider-color);
        margin-top: 8px;
        padding-top: 8px;
      }
      .ht-event-row {
        display: grid;
        grid-template-columns: 10px 56px 32px 1fr;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        font-size: 0.78rem;
        border-bottom: 1px solid var(--divider-color);
        line-height: 1.3;
      }
      .ht-event-row:last-child { border-bottom: none; }
      .ht-event-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .ht-event-goal .ht-event-dot    { background: #388e3c; }
      .ht-event-penalty .ht-event-dot { background: #e65100; }
      .ht-event-shot .ht-event-dot    { background: #0288d1; }
      .ht-event-meta {
        color: var(--secondary-text-color);
        font-size: 0.72rem;
        white-space: nowrap;
      }
      .ht-event-abbrev {
        font-weight: 700;
        font-size: 0.74rem;
        color: var(--primary-text-color);
      }
      .ht-event-body {
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.78rem;
      }
      .ht-event--ours .ht-event-body { color: var(--primary-text-color); }
      .ht-event-tag {
        display: inline-block;
        padding: 0 3px;
        border-radius: 3px;
        font-size: 0.62rem;
        font-weight: 700;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        vertical-align: middle;
        margin-left: 2px;
      }
      .ht-event-assists {
        color: var(--secondary-text-color);
        font-size: 0.72rem;
      }

      /* ── Recent games ───────────────────────────────── */
      .ht-recent {
        border-top: 1px solid var(--divider-color);
        margin-top: 10px;
        padding-top: 8px;
      }
      .ht-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .ht-section-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        margin-bottom: 0;
      }
      .ht-collapse-btn {
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color);
        cursor: pointer;
        flex-shrink: 0;
      }
      .ht-recent-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 0;
        font-size: 0.82rem;
        border-bottom: 1px solid var(--divider-color);
        cursor: default;
      }
      .ht-recent-row--link {
        cursor: pointer;
      }
      .ht-recent-row--link:hover .ht-opponent,
      .ht-recent-row--link:hover .ht-recent-score {
        text-decoration: underline;
        color: var(--primary-color);
      }
      .ht-recent-row:last-child { border-bottom: none; }
      .ht-result {
        font-weight: 700;
        font-size: 0.78rem;
        width: 16px;
        flex-shrink: 0;
      }
      .ht-result--win  { color: #388e3c; }
      .ht-result--loss { color: #d32f2f; }
      .ht-opponent {
        flex: 1;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ht-recent-score {
        font-weight: 600;
        color: var(--primary-text-color);
        flex-shrink: 0;
      }
      .ht-recent-date {
        color: var(--secondary-text-color);
        flex-shrink: 0;
        font-size: 0.78rem;
      }
      .ht-recent-link-icon {
        --mdc-icon-size: 13px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        opacity: 0.6;
      }

      /* ── Game page link ─────────────────────────────── */
      .ht-game-link {
        text-align: center;
        margin-top: 6px;
        font-size: 0.78rem;
      }
      .ht-game-link a {
        color: var(--primary-color, #03a9f4);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .ht-game-link a:hover { text-decoration: underline; }
      .ht-game-link ha-icon { --mdc-icon-size: 13px; }
    `;
	}
	static getConfigElement() {
		return document.createElement("hockey-tracker-card-editor");
	}
	static getStubConfig(e) {
		return {
			entity: xe(e, !1),
			show_logo: !0,
			show_shots: !0,
			show_next_game: !0,
			show_recent_games: !1,
			recent_games_count: 3,
			collapsible_recent: !0,
			auto_collapse_recent: !0,
			show_events: !1,
			events_count: 10,
			collapsible_events: !0,
			show_event_goals: !0,
			show_event_penalties: !0,
			show_event_shots: !0,
			logo_size: 64,
			show_last_updated: !0
		};
	}
	setConfig(e) {
		if (!e.entity) throw Error("Required: entity");
		this.config = {
			show_logo: !0,
			show_shots: !0,
			show_next_game: !0,
			show_recent_games: !1,
			recent_games_count: 3,
			collapsible_recent: !0,
			auto_collapse_recent: !0,
			show_events: !1,
			events_count: 10,
			collapsible_events: !0,
			show_event_goals: !0,
			show_event_penalties: !0,
			show_event_shots: !0,
			logo_size: 64,
			show_last_updated: !0,
			...e
		};
	}
	willUpdate(e) {
		if (super.willUpdate(e), !e.has("hass")) return;
		let t = this.hass?.states[this.config?.entity];
		if (!t) return;
		let n = t.state;
		(n === "LIVE" || n === "FINAL") && this._showLastGame && (this._showLastGame = !1);
		let r = n === "LIVE";
		this.config.auto_collapse_recent !== !1 && (r && !this._prevLive ? this._recentCollapsed = !0 : !r && this._prevLive && (this._recentCollapsed = !1)), this._prevLive = r;
	}
	connectedCallback() {
		super.connectedCallback(), this._ageTimer = setInterval(() => this.requestUpdate(), 3e4);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), clearInterval(this._ageTimer), this._ageTimer = null;
	}
	getCardSize() {
		return 4;
	}
	_displayMode(e, t) {
		return e === "LIVE" || e === "FINAL" || e === "PRE" && t.start_time && (new Date(t.start_time) - Date.now()) / 6e4 <= 30 ? "game" : "upcoming";
	}
	render() {
		if (!this.hass || !this.config) return L``;
		let e = this.hass.states[this.config.entity];
		if (!e) return L`<ha-card><div class="ht-content">Entity not found: ${this.config.entity}</div></ha-card>`;
		let t = e.state, n = e.attributes, r = t === "NO_GAME" || t === "PRE", i = this._showLastGame && r, a = i ? "last_game" : this._displayMode(t, n);
		return L`
      <ha-card>
        <div class="ht-content">
          <div class="ht-header">
            <span class="ht-badge ${{
			LIVE: "ht-badge--live",
			PRE: "ht-badge--pre",
			FINAL: "ht-badge--final",
			NO_GAME: "ht-badge--none"
		}[t] ?? "ht-badge--none"}">${{
			LIVE: "Live",
			PRE: "Pre-Game",
			FINAL: "Final",
			NO_GAME: "No Game"
		}[t] ?? t}</span>
            <span class="ht-title">${this._cardTitle(n, e)}</span>
            ${r ? L`
              <ha-icon-button
                class="ht-history-btn${i ? " ht-history-btn--active" : ""}"
                label="${i ? "Current" : "Last Game"}"
                @click=${() => {
			this._showLastGame = !this._showLastGame, this.requestUpdate();
		}}
              >
                <ha-icon icon="${i ? "mdi:close" : "mdi:history"}"></ha-icon>
              </ha-icon-button>
            ` : ""}
            <ha-icon-button class="ht-refresh-btn" label="Refresh" @click=${this._refresh}>
              <ha-icon icon="mdi:refresh"></ha-icon>
            </ha-icon-button>
          </div>

          ${this.config.show_last_updated !== !1 && n.last_fetched ? L`
            <div class="ht-last-updated">Updated ${this._fmtAge(n.last_fetched)}</div>
          ` : ""}

          ${a === "last_game" ? this._renderLastGame(n) : a === "game" ? this._renderGame(n, t) : this._renderUpcoming(n, t)}

          ${this.config.show_events ? a === "last_game" && n.last_game_events?.length ? this._renderGameEvents(n.last_game_events) : a === "game" && n.game_events?.length ? this._renderGameEvents(n.game_events) : "" : ""}

          ${this.config.show_recent_games && n.recent_games?.length ? this._renderRecentGames(n.recent_games) : ""}
        </div>
      </ha-card>
    `;
	}
	_renderGame(e, t) {
		let n = t !== "PRE";
		return L`
      <div class="ht-scoreboard">
        <div class="ht-team">
          ${this._logo(e.away_logo_url)}
          <div class="ht-team-name">${e.away_team ?? "Away"}</div>
          ${n ? L`<div class="ht-score">${e.away_score ?? "—"}</div>` : L`<div class="ht-score-dash">—</div>`}
        </div>

        <div class="ht-mid">
          <span class="ht-at-sign">@</span>
        </div>

        <div class="ht-team">
          ${this._logo(e.home_logo_url)}
          <div class="ht-team-name">${e.home_team ?? "Home"}</div>
          ${n ? L`<div class="ht-score">${e.home_score ?? "—"}</div>` : L`<div class="ht-score-dash">—</div>`}
        </div>
      </div>

      ${t === "PRE" ? L`
        <div class="ht-start-time">${this._fmtGameTime(e.start_time)}</div>
      ` : ""}

      ${t === "LIVE" && (e.period || e.clock) ? L`
        <div class="ht-period">
          ${e.period ? this._periodLabel(e.period) : ""}${e.clock ? ` · ${e.clock}` : ""}
        </div>
      ` : ""}

      ${this.config.show_shots && n && (e.away_shots != null || e.home_shots != null) ? L`
        <div class="ht-shots">
          <span>${e.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${e.home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${e.venue ? L`<div class="ht-venue">${e.venue}</div>` : ""}

      ${(t === "LIVE" || t === "FINAL") && e.game_url ? L`
        <div class="ht-game-link">
          <a href="${e.game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}
    `;
	}
	_renderLastGame(e) {
		return e.last_game_home_team ? L`
      <div class="ht-last-game-label">Previous Game · Final</div>
      <div class="ht-scoreboard">
        <div class="ht-team">
          ${this._logo(e.last_game_away_logo_url)}
          <div class="ht-team-name">${e.last_game_away_team ?? "Away"}</div>
          <div class="ht-score">${e.last_game_away_score ?? "—"}</div>
        </div>
        <div class="ht-mid">
          <span class="ht-at-sign">@</span>
        </div>
        <div class="ht-team">
          ${this._logo(e.last_game_home_logo_url)}
          <div class="ht-team-name">${e.last_game_home_team ?? "Home"}</div>
          <div class="ht-score">${e.last_game_home_score ?? "—"}</div>
        </div>
      </div>

      ${this.config.show_shots && (e.last_game_away_shots != null || e.last_game_home_shots != null) ? L`
        <div class="ht-shots">
          <span>${e.last_game_away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${e.last_game_home_shots ?? "—"}</span>
        </div>
      ` : ""}

      ${e.last_game_venue ? L`<div class="ht-venue">${e.last_game_venue}</div>` : ""}

      ${e.last_game_date ? L`
        <div class="ht-venue">${this._fmtGameTime(e.last_game_date)}</div>
      ` : ""}

      ${e.last_game_url ? L`
        <div class="ht-game-link">
          <a href="${e.last_game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}
    ` : L`
        <div class="ht-last-game-empty">
          <div class="ht-last-game-empty-text">No saved data from last game</div>
          <button class="ht-last-game-load-btn" @click=${this._refresh}>
            <ha-icon icon="mdi:download"></ha-icon>
            Load Last Game
          </button>
        </div>
      `;
	}
	_renderUpcoming(e, t) {
		return t === "PRE" ? L`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${this._isToday(e.start_time) ? "Today's Game" : "Next Game"}</div>
          ${this._upcomingTeams(e.away_logo_url, e.away_team, e.home_logo_url, e.home_team)}
          <div class="ht-next-game-time">${this._fmtGameTime(e.start_time)}</div>
          ${e.venue ? L`<div class="ht-next-game-venue">${e.venue}</div>` : ""}
        </div>
      ` : this.config.show_next_game ? e.next_game_date ? L`
      <div class="ht-next-game">
        <div class="ht-next-game-label">Next Game</div>
        ${this._upcomingTeams(e.next_game_away_logo_url, e.next_game_away_team, e.next_game_home_logo_url, e.next_game_home_team)}
        <div class="ht-next-game-time">${this._fmtGameTime(e.next_game_date)}</div>
        ${e.next_game_venue ? L`<div class="ht-next-game-venue">${e.next_game_venue}</div>` : ""}
      </div>
    ` : L`
        <div class="ht-no-games">
          ${this.config.show_logo && e.team_logo_url ? L`
            <div class="ht-no-games-logo">${this._logo(e.team_logo_url)}</div>
          ` : ""}
          <div class="ht-no-games-text">No upcoming games scheduled</div>
        </div>
      ` : L``;
	}
	_upcomingTeams(e, t, n, r) {
		return L`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._logo(e)}
          <span>${t ?? "Away"}</span>
        </div>
        <span class="ht-next-game-at">@</span>
        <div class="ht-next-game-team">
          ${this._logo(n)}
          <span>${r ?? "Home"}</span>
        </div>
      </div>
    `;
	}
	_renderGameEvents(e) {
		let t = e.filter((e) => !(e.type === "goal" && this.config.show_event_goals === !1 || e.type === "penalty" && this.config.show_event_penalties === !1 || e.type === "shot" && this.config.show_event_shots === !1)), n = Math.min(this.config.events_count || 10, t.length), r = this.config.collapsible_events !== !1, i = r && this._eventsCollapsed;
		return L`
      <div class="ht-events">
        <div class="ht-section-header">
          <span class="ht-section-label">Game Events</span>
          ${r ? L`
            <ha-icon
              class="ht-collapse-btn"
              icon="${i ? "mdi:chevron-down" : "mdi:chevron-up"}"
              @click=${() => {
			this._eventsCollapsed = !this._eventsCollapsed, this.requestUpdate();
		}}
            ></ha-icon>
          ` : ""}
        </div>
        ${i ? "" : t.slice(0, n).map((e) => e.type === "goal" ? this._renderGoal(e) : e.type === "shot" ? this._renderShot(e) : this._renderPenalty(e))}
      </div>
    `;
	}
	_renderGoal(e) {
		let t = e.is_power_play ? "PP" : e.is_short_handed ? "SH" : e.is_empty_net ? "EN" : "", n = e.assists?.length ? L`<span class="ht-event-assists"> · ${e.assists.join(", ")}</span>` : "";
		return L`
      <div class="ht-event-row ht-event-goal ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">
          ${e.player_number == null ? "" : `#${e.player_number} `}${e.player_name}${t ? L`<span class="ht-event-tag">${t}</span>` : ""}${n}
        </span>
      </div>
    `;
	}
	_renderPenalty(e) {
		return L`
      <div class="ht-event-row ht-event-penalty ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">${e.player_number == null ? "" : `#${e.player_number} `}${e.player_name} — ${e.description} (${e.minutes}min)</span>
      </div>
    `;
	}
	_renderShot(e) {
		return L`
      <div class="ht-event-row ht-event-shot ${e.is_tracked_team ? "ht-event--ours" : ""}">
        <span class="ht-event-dot"></span>
        <span class="ht-event-meta">P${e.period} · ${e.time}</span>
        <span class="ht-event-abbrev">${e.team_abbrev}</span>
        <span class="ht-event-body">SOG: ${e.player_name}</span>
      </div>
    `;
	}
	_renderRecentGames(e) {
		let t = Math.min(this.config.recent_games_count || 3, e.length), n = this.config.collapsible_recent !== !1, r = n && this._recentCollapsed;
		return L`
      <div class="ht-recent">
        <div class="ht-section-header">
          <span class="ht-section-label">Recent Games</span>
          ${n ? L`
            <ha-icon
              class="ht-collapse-btn"
              icon="${r ? "mdi:chevron-down" : "mdi:chevron-up"}"
              @click=${() => {
			this._recentCollapsed = !this._recentCollapsed, this.requestUpdate();
		}}
            ></ha-icon>
          ` : ""}
        </div>
        ${r ? "" : e.slice(0, t).map((e) => L`
          <div
            class="ht-recent-row ${e.game_url ? "ht-recent-row--link" : ""}"
            @click=${() => e.game_url && window.open(e.game_url, "_blank", "noopener")}
          >
            <span class="ht-result ${e.win ? "ht-result--win" : "ht-result--loss"}">${e.win ? "W" : "L"}</span>
            <span class="ht-opponent">${e.is_home ? "vs" : "@"} ${e.opponent}</span>
            <span class="ht-recent-score">${e.team_score}–${e.opponent_score}</span>
            <span class="ht-recent-date">${this._fmtShortDate(e.date)}</span>
            ${e.game_url ? L`<ha-icon class="ht-recent-link-icon" icon="mdi:open-in-new"></ha-icon>` : ""}
          </div>
        `)}
      </div>
    `;
	}
	_cardTitle(e, t) {
		return this.config.title ? this.config.title : e.home_team && e.away_team ? e.is_home ? e.home_team : e.away_team : e.team_name || t.attributes.friendly_name?.replace(/ Game$/i, "") || "";
	}
	_logo(e, t) {
		return t = t ?? this.config.logo_size ?? 64, this.config.show_logo ? e && !this._failedLogos.has(e) ? L`
        <img
          class="ht-logo"
          style="width:${t}px;height:${t}px"
          src="${e}"
          alt=""
          @error=${() => {
			this._failedLogos.add(e), this.requestUpdate();
		}}
        >` : L`<ha-icon class="ht-logo-icon" style="--mdc-icon-size:${t}px" icon="mdi:hockey-puck"></ha-icon>` : L``;
	}
	_periodLabel(e) {
		return e <= 3 ? `Period ${e}` : e === 4 ? "OT" : `OT${e - 3}`;
	}
	_isToday(e) {
		if (!e) return !1;
		try {
			let t = {
				timeZone: this.hass?.config?.time_zone ?? void 0,
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			};
			return new Date(e).toLocaleDateString(void 0, t) === (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, t);
		} catch {
			return new Date(e).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
		}
	}
	_fmtGameTime(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleString(void 0, {
				timeZone: t,
				weekday: "short",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				timeZoneName: "short"
			});
		} catch {
			return e;
		}
	}
	_fmtShortDate(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleDateString(void 0, {
				timeZone: t,
				month: "short",
				day: "numeric"
			});
		} catch {
			return e;
		}
	}
	_fmtAge(e) {
		if (!e) return "";
		try {
			let t = Math.floor((Date.now() - new Date(e)) / 1e3);
			if (t < 10) return "just now";
			if (t < 60) return `${t}s ago`;
			let n = Math.floor(t / 60);
			return n < 60 ? `${n}m ago` : `${Math.floor(n / 60)}h ago`;
		} catch {
			return "";
		}
	}
	async _refresh() {
		this.hass && this.config.entity && await Se(this.hass, this.config.entity);
	}
};
Q("hockey-tracker-card", $), Q("hockey-playoff-card-editor", class e extends J {
	static get properties() {
		return {
			hass: {},
			config: {}
		};
	}
	setConfig(e) {
		this.config = {
			show_logo: !0,
			logo_size: 132,
			show_shots: !0,
			show_next_game: !0,
			show_events: !0,
			events_count: 10,
			collapsible_events: !0,
			show_event_goals: !0,
			show_event_penalties: !0,
			show_event_shots: !0,
			show_last_updated: !0,
			...e
		};
	}
	static get _schema() {
		return [
			{
				name: "entity",
				required: !0,
				selector: { entity: { domain: "sensor" } }
			},
			{
				name: "title",
				selector: { text: {} }
			},
			{
				name: "show_logo",
				selector: { boolean: {} }
			},
			{
				name: "logo_size",
				default: 132,
				selector: { number: {
					min: 24,
					max: 200,
					step: 4,
					mode: "slider"
				} }
			},
			{
				name: "show_shots",
				selector: { boolean: {} }
			},
			{
				name: "show_next_game",
				selector: { boolean: {} }
			},
			{
				name: "show_events",
				selector: { boolean: {} }
			},
			{
				name: "events_count",
				default: 10,
				selector: { number: {
					min: 3,
					max: 25,
					step: 1,
					mode: "box"
				} }
			},
			{
				name: "collapsible_events",
				selector: { boolean: {} }
			},
			{
				name: "show_event_goals",
				selector: { boolean: {} }
			},
			{
				name: "show_event_penalties",
				selector: { boolean: {} }
			},
			{
				name: "show_event_shots",
				selector: { boolean: {} }
			},
			{
				name: "show_last_updated",
				selector: { boolean: {} }
			}
		];
	}
	_computeLabel(e) {
		return {
			entity: "Sensor Entity",
			title: "Card Title (leave blank to auto-derive)",
			show_logo: "Show team logos",
			logo_size: "Game view logo size in px (24–200, default: 132)",
			show_shots: "Show shots on goal in game view",
			show_next_game: "Show next game when no game is active",
			show_events: "Show live game events (goals & penalties) in game view",
			events_count: "Number of events to display (3–25, default: 10)",
			collapsible_events: "Allow game events section to be collapsed",
			show_event_goals: "Show goal events in ticker",
			show_event_penalties: "Show penalty events in ticker",
			show_event_shots: "Show shot events in ticker (NHL only)",
			show_last_updated: "Show time since last data refresh"
		}[e.name] ?? e.name;
	}
	_valueChanged(e) {
		e.stopPropagation(), this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e.detail.value } }));
	}
	render() {
		return !this.hass || !this.config ? L`` : L`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${e._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
	}
}), Q("hockey-playoff-card", class extends J {
	static get properties() {
		return {
			hass: {},
			config: {},
			_view: { state: !0 },
			_collapsedRounds: { state: !0 },
			_eventsCollapsed: { state: !0 },
			_selectedSeries: { state: !0 }
		};
	}
	static get styles() {
		return [$.styles, o`
        ha-card { overflow: hidden; }
        .hp-content { padding: 12px 16px; }

        /* Header */
        .hp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .hp-badge { padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #fff; background: #555; flex-shrink: 0; }
        .hp-badge--live { background: #c62828; animation: hp-pulse 1.6s ease-in-out infinite; }
        .hp-badge--pre  { background: #1565c0; }
        .hp-badge--final{ background: #2e7d32; }
        .hp-badge--none { background: #555; }
        @keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        .hp-title { flex: 1; font-weight: 600; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
        .hp-header-btns { display: flex; gap: 4px; flex-shrink: 0; }
        .hp-icon-btn { background: none; border: none; cursor: pointer; color: var(--primary-text-color); opacity: 0.6; padding: 4px; border-radius: 4px; font-size: 1.1rem; line-height: 1; }
        .hp-icon-btn:hover { opacity: 1; background: var(--secondary-background-color); }
        .hp-icon-btn--active { opacity: 1; color: var(--primary-color); }
        .hp-last-updated { font-size: 0.7rem; color: var(--secondary-text-color); margin-bottom: 10px; }

        /* Round headers */
        .hp-round { margin-bottom: 10px; }
        .hp-round-header { display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--secondary-text-color); padding: 4px 0; border-bottom: 1px solid var(--divider-color); margin-bottom: 6px; cursor: pointer; user-select: none; }
        .hp-round-chevron { font-size: 0.8rem; transition: transform 0.2s; }
        .hp-round-chevron--open { transform: rotate(90deg); }

        /* Series — stacked matchup layout */
        .hp-series { margin-bottom: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--divider-color); transition: border-color 0.15s; }
        .hp-series:hover { border-color: var(--secondary-text-color); }
        .hp-series--followed { border-color: var(--primary-color, #03a9f4); border-left: 3px solid var(--primary-color, #03a9f4); }
        .hp-series-team-row { display: flex; align-items: center; gap: 6px; padding: 5px 8px; }
        .hp-series-team-row + .hp-series-team-row { border-top: 1px solid var(--divider-color); }
        .hp-series-logo { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
        .hp-series-logo-ph { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--secondary-text-color); flex-shrink: 0; }
        .hp-series-abbrev { font-size: 0.75rem; font-weight: 700; color: var(--primary-text-color); flex-shrink: 0; min-width: 30px; }
        .hp-series-abbrev--winner { color: var(--primary-color, #03a9f4); }
        .hp-series-name { flex: 1; font-size: 0.75rem; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hp-series-wins { font-size: 1.05rem; font-weight: 700; color: var(--primary-text-color); min-width: 16px; text-align: right; flex-shrink: 0; }
        .hp-series-wins--leader { color: var(--primary-color, #03a9f4); }
        .hp-series-wins--loser { color: var(--secondary-text-color); font-weight: 400; }
        .hp-series-status-row { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 3px 8px 4px; background: var(--secondary-background-color); border-top: 1px solid var(--divider-color); }
        .hp-series-live-score { font-size: 0.8rem; font-weight: 700; color: var(--primary-text-color); }
        .hp-series-status { font-size: 0.68rem; text-align: center; color: var(--secondary-text-color); }
        .hp-series-status--live { color: #c62828; font-weight: 700; }
        .hp-series-status--pre { color: #1565c0; }

        /* Series wins column header in bracket */
        .hp-series-wins-hdr-row { display: flex; justify-content: flex-end; padding: 2px 8px 0; }
        .hp-series-wins-hdr { font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--disabled-color, #9e9e9e); }
        /* Series detail — standings */
        .hp-standings-heading { font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--secondary-text-color); text-align: center; padding: 8px 0 4px; }
        .hp-standings-row { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 2px 0 6px; }
        .hp-standings-team { font-size: 0.8rem; color: var(--secondary-text-color); flex: 1; text-align: center; }
        .hp-standings-score { font-size: 1.8rem; font-weight: 700; color: var(--primary-text-color); line-height: 1; }
        .hp-standings-dash { font-size: 1.2rem; color: var(--secondary-text-color); }
        .hp-standings-leader { color: var(--primary-color, #03a9f4) !important; }
        .hp-standings-divider { border-top: 1px solid var(--divider-color); margin: 0 0 8px; }
        .hp-series-no-game-status { text-align: center; font-size: 0.78rem; color: var(--secondary-text-color); padding: 4px 0; }
        /* hp-standings-divider already provides the visual separator; cancel the inherited border */
        .ht-next-game { border-top: none; padding-top: 4px; }
      `];
	}
	constructor() {
		super(), this._view = "bracket", this._collapsedRounds = /* @__PURE__ */ new Set(), this._eventsCollapsed = !1, this._autoCollapseDone = !1, this._failedLogos = /* @__PURE__ */ new Set(), this._selectedSeries = null;
	}
	setConfig(e) {
		if (!e.entity) throw Error("entity is required");
		this.config = {
			show_logo: !0,
			logo_size: 132,
			show_shots: !0,
			show_next_game: !0,
			show_events: !0,
			events_count: 10,
			collapsible_events: !0,
			show_event_goals: !0,
			show_event_penalties: !0,
			show_event_shots: !0,
			show_last_updated: !0,
			...e
		}, this._autoCollapseDone = !1, this._failedLogos = /* @__PURE__ */ new Set();
	}
	static getConfigElement() {
		return document.createElement("hockey-playoff-card-editor");
	}
	static getStubConfig(e) {
		return { entity: xe(e, !0) };
	}
	willUpdate(e) {
		if (super.willUpdate(e), !this._autoCollapseDone && this._view === "bracket") {
			let e = this._attr.bracket || [];
			if (e.length > 0 && (this._autoCollapseDone = !0, e.length > 1)) {
				let t = this._attr.current_round || 0, n = /* @__PURE__ */ new Set();
				for (let r of e) r.round_number < t && n.add(r.round_number);
				this._collapsedRounds = n;
			}
		}
	}
	get _stateObj() {
		return this.hass?.states[this.config?.entity];
	}
	get _attr() {
		return this._stateObj?.attributes || {};
	}
	_badge() {
		return this._stateObj?.state === "LIVE" ? L`<span class="hp-badge hp-badge--live">LIVE</span>` : L`<ha-icon icon="mdi:hockey-puck" style="color:var(--secondary-text-color);opacity:0.5;flex-shrink:0;--mdi-icon-size:1.2rem;"></ha-icon>`;
	}
	_title() {
		if (this.config.title) return this.config.title;
		let e = this._attr.league || "";
		return {
			NHL: "Stanley Cup Playoffs",
			AHL: "Calder Cup Playoffs",
			ECHL: "Kelly Cup Playoffs",
			OHL: "OHL Playoffs",
			WHL: "WHL Playoffs",
			QMJHL: "President's Cup Playoffs",
			PWHL: "PWHL Playoffs",
			USHL: "Clark Cup Playoffs"
		}[e] || `${e} Playoffs`;
	}
	_timeAgo(e) {
		if (!e) return "";
		try {
			let t = Math.floor((Date.now() - new Date(e).getTime()) / 1e3);
			return t < 10 ? "just now" : t < 60 ? `${t}s ago` : t < 3600 ? `${Math.floor(t / 60)}m ago` : `${Math.floor(t / 3600)}h ago`;
		} catch {
			return "";
		}
	}
	_renderBracket() {
		let e = this._attr.bracket || [];
		return e.length ? L`${e.map((e) => L`
      <div class="hp-round">
        <div class="hp-round-header" @click=${() => this._toggleRound(e.round_number)}>
          <span>${e.round_name}</span>
          <span class="hp-round-chevron ${this._collapsedRounds.has(e.round_number) ? "" : "hp-round-chevron--open"}">▶</span>
        </div>
        ${this._collapsedRounds.has(e.round_number) ? L`` : L`${e.series.map((e) => this._renderSeries(e))}`}
      </div>
    `)}` : L`<div style="text-align:center;padding:20px 0;color:var(--secondary-text-color)">No playoff data available.</div>`;
	}
	_toggleRound(e) {
		let t = new Set(this._collapsedRounds);
		t.has(e) ? t.delete(e) : t.add(e), this._collapsedRounds = t;
	}
	_renderSeries(e) {
		let t = e.team1_is_followed || e.team2_is_followed, n = e.team1_wins || 0, r = e.team2_wins || 0, i = e.status === "complete", a = n > r, o = r > n, s = e.game_state === "LIVE", c = this.config.show_logo !== !1;
		return L`
      <div class="hp-series ${t ? "hp-series--followed" : ""}"
           style="cursor:pointer"
           @click=${(t) => {
			t.stopPropagation(), this._selectSeries(e);
		}}>
        <div class="hp-series-wins-hdr-row">
          <span class="hp-series-wins-hdr">W</span>
        </div>
        <div class="hp-series-team-row">
          ${c ? this._seriesLogo(e.team1_logo_url, e.team1_abbrev) : ""}
          <span class="hp-series-abbrev ${e.winner_id === e.team1_id ? "hp-series-abbrev--winner" : ""}">${e.team1_abbrev || "TBD"}</span>
          <span class="hp-series-name">${e.team1_name || ""}</span>
          <span class="hp-series-wins ${a ? "hp-series-wins--leader" : i && !a ? "hp-series-wins--loser" : ""}">${n}</span>
        </div>
        <div class="hp-series-team-row">
          ${c ? this._seriesLogo(e.team2_logo_url, e.team2_abbrev) : ""}
          <span class="hp-series-abbrev ${e.winner_id === e.team2_id ? "hp-series-abbrev--winner" : ""}">${e.team2_abbrev || "TBD"}</span>
          <span class="hp-series-name">${e.team2_name || ""}</span>
          <span class="hp-series-wins ${o ? "hp-series-wins--leader" : i && !o ? "hp-series-wins--loser" : ""}">${r}</span>
        </div>
        <div class="hp-series-status-row">
          ${s ? L`<span class="hp-series-live-score">${e.game_score || "0-0"}</span>` : ""}
          <span class="hp-series-status ${s ? "hp-series-status--live" : e.game_state === "PRE" ? "hp-series-status--pre" : ""}">${this._seriesStatusLabel(e)}</span>
        </div>
      </div>
    `;
	}
	_selectSeries(e) {
		this._selectedSeries = e, this._view = "series", this.requestUpdate();
	}
	_seriesLogo(e, t) {
		return !e || this._failedLogos.has(e) ? L`<div class="hp-series-logo-ph">${t || "?"}</div>` : L`
      <img
        class="hp-series-logo"
        src="${e}"
        alt="${t || ""}"
        @error=${() => {
			this._failedLogos.add(e), this.requestUpdate();
		}}
      >`;
	}
	_fmtSeriesTime(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleTimeString(void 0, {
				timeZone: t,
				hour: "numeric",
				minute: "2-digit",
				timeZoneName: "short"
			});
		} catch {
			return "";
		}
	}
	_fmtSeriesDateTime(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleString(void 0, {
				timeZone: t,
				weekday: "short",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				timeZoneName: "short"
			});
		} catch {
			return e;
		}
	}
	_seriesStatusLabel(e) {
		if (e.game_state === "LIVE") return [e.game_period ? `P${e.game_period}` : "", e.game_clock || ""].filter(Boolean).join(" ") || "LIVE";
		if (e.game_state === "PRE") return `${this._isToday(e.game_start_time) ? "Today" : this._fmtShortDate(e.game_start_time) || "Upcoming"}${e.game_start_time ? ` · ${this._fmtSeriesTime(e.game_start_time)}` : ""}`;
		if (e.status === "complete") return `${e.team1_wins > e.team2_wins ? e.team1_abbrev : e.team2_abbrev} wins ${Math.max(e.team1_wins, e.team2_wins)}–${Math.min(e.team1_wins, e.team2_wins)}`;
		if (e.status === "scheduled") return "Upcoming";
		let t = e.team1_wins || 0, n = e.team2_wins || 0;
		return t === n ? t > 0 ? `Tied ${t}–${n}` : "Game 1" : `${t > n ? e.team1_abbrev : e.team2_abbrev} leads ${Math.max(t, n)}–${Math.min(t, n)}`;
	}
	_periodLabel(e) {
		return e <= 3 ? `Period ${e}` : e === 4 ? "OT" : `OT${e - 3}`;
	}
	_isToday(e) {
		if (!e) return !1;
		try {
			let t = {
				timeZone: this.hass?.config?.time_zone ?? void 0,
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			};
			return new Date(e).toLocaleDateString(void 0, t) === (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, t);
		} catch {
			return new Date(e).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
		}
	}
	_fmtGameTime(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleString(void 0, {
				timeZone: t,
				weekday: "short",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				timeZoneName: "short"
			});
		} catch {
			return e;
		}
	}
	_fmtShortDate(e) {
		if (!e) return "";
		try {
			let t = this.hass?.config?.time_zone ?? void 0;
			return new Date(e).toLocaleDateString(void 0, {
				timeZone: t,
				month: "short",
				day: "numeric"
			});
		} catch {
			return e;
		}
	}
	_upcomingTeams(e, t, n, r) {
		return L`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._gameLogo(e, 64)}
          <span>${t ?? "Away"}</span>
        </div>
        <span class="ht-next-game-at">@</span>
        <div class="ht-next-game-team">
          ${this._gameLogo(n, 64)}
          <span>${r ?? "Home"}</span>
        </div>
      </div>
    `;
	}
	_seriesTeams(e, t, n, r) {
		return L`
      <div class="ht-next-game-teams">
        <div class="ht-next-game-team">
          ${this._gameLogo(e, 64)}
          <span>${t ?? "Team 1"}</span>
        </div>
        <span class="ht-next-game-at">vs</span>
        <div class="ht-next-game-team">
          ${this._gameLogo(n, 64)}
          <span>${r ?? "Team 2"}</span>
        </div>
      </div>
    `;
	}
	_isActiveGame(e) {
		let t = this._attr, n = t.home_team_id, r = t.away_team_id;
		if (n && r) {
			let t = /* @__PURE__ */ new Set([String(n), String(r)]);
			if (t.has(String(e.team1_id)) && t.has(String(e.team2_id))) return !0;
		}
		let i = t.home_team_abbrev, a = t.away_team_abbrev;
		if (i && a && e.team1_abbrev && e.team2_abbrev) {
			let t = /* @__PURE__ */ new Set([String(i), String(a)]);
			if (t.has(String(e.team1_abbrev)) && t.has(String(e.team2_abbrev))) return !0;
		}
		return !1;
	}
	_renderSeriesDetail(e) {
		let t = this._isActiveGame(e), n = this._stateObj?.state || "NO_GAME", r = this._attr, i = e.team1_wins ?? 0, a = e.team2_wins ?? 0;
		return L`
      <div class="hp-standings-heading">Series</div>
      <div class="hp-standings-row">
        <span class="hp-standings-team ${i > a ? "hp-standings-leader" : ""}">${e.team1_name || e.team1_abbrev || "TBD"}</span>
        <span class="hp-standings-score ${i > a ? "hp-standings-leader" : ""}">${i}</span>
        <span class="hp-standings-dash">–</span>
        <span class="hp-standings-score ${a > i ? "hp-standings-leader" : ""}">${a}</span>
        <span class="hp-standings-team ${a > i ? "hp-standings-leader" : ""}">${e.team2_name || e.team2_abbrev || "TBD"}</span>
      </div>
      <div class="hp-standings-divider"></div>
      ${this._renderSeriesGameSection(e, t, n, r)}
    `;
	}
	_renderSeriesGameSection(e, t, n, r) {
		return t ? this._seriesDisplayMode(n, r) === "game" ? this._renderSeriesGameView(n, r) : this._renderSeriesUpcomingView(n, r) : this._renderSeriesNonActiveGame(e);
	}
	_seriesDisplayMode(e, t) {
		return e === "LIVE" || e === "FINAL" || e === "PRE" && t.start_time && (new Date(t.start_time) - Date.now()) / 6e4 <= 30 ? "game" : "upcoming";
	}
	_renderSeriesGameView(e, t) {
		let n = e !== "PRE", r = this.config.logo_size ?? 64, i = this.config.show_shots !== !1 && (t.home_shots != null || t.away_shots != null);
		return L`
      <div class="ht-scoreboard" style="border-top:none">
        <div class="ht-team">
          ${this._gameLogo(t.away_logo_url, r)}
          <div class="ht-team-name">${t.away_team ?? "Away"}</div>
          ${n ? L`<div class="ht-score">${t.away_score ?? "—"}</div>` : L`<div class="ht-score-dash">—</div>`}
        </div>
        <div class="ht-mid"><span class="ht-at-sign">@</span></div>
        <div class="ht-team">
          ${this._gameLogo(t.home_logo_url, r)}
          <div class="ht-team-name">${t.home_team ?? "Home"}</div>
          ${n ? L`<div class="ht-score">${t.home_score ?? "—"}</div>` : L`<div class="ht-score-dash">—</div>`}
        </div>
      </div>
      ${e === "PRE" ? L`
        <div class="ht-start-time">${this._fmtGameTime(t.start_time)}</div>
      ` : ""}
      ${e === "LIVE" && (t.period || t.clock) ? L`
        <div class="ht-period">
          ${t.period ? this._periodLabel(t.period) : ""}${t.clock ? ` · ${t.clock}` : ""}
        </div>
      ` : ""}
      ${e === "FINAL" ? L`<div class="ht-period">Final</div>` : ""}
      ${n && i ? L`
        <div class="ht-shots">
          <span>${t.away_shots ?? "—"}</span>
          <span>Shots on Goal</span>
          <span>${t.home_shots ?? "—"}</span>
        </div>
      ` : ""}
      ${t.venue ? L`<div class="ht-venue">${t.venue}</div>` : ""}

      ${(e === "LIVE" || e === "FINAL") && t.game_url ? L`
        <div class="ht-game-link">
          <a href="${t.game_url}" target="_blank" rel="noopener noreferrer">
            <ha-icon icon="mdi:open-in-new"></ha-icon>View on league site
          </a>
        </div>
      ` : ""}

      ${this._renderPlayoffEvents(t, !0)}
    `;
	}
	_renderSeriesUpcomingView(e, t) {
		if (e === "PRE") return L`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${this._isToday(t.start_time) ? "Today's Game" : "Next Game"}</div>
          ${this._upcomingTeams(t.away_logo_url, t.away_team, t.home_logo_url, t.home_team)}
          <div class="ht-next-game-time">${this._fmtGameTime(t.start_time)}</div>
          ${t.venue ? L`<div class="ht-next-game-venue">${t.venue}</div>` : ""}
        </div>
      `;
		if (!this.config.show_next_game) return L``;
		let n = t.next_game;
		return n?.game_date ? L`
      <div class="ht-next-game">
        <div class="ht-next-game-label">Next Game</div>
        ${this._upcomingTeams(n.away_logo_url, n.away_team, n.home_logo_url, n.home_team)}
        <div class="ht-next-game-time">${this._fmtGameTime(n.game_date)}</div>
        ${n.venue ? L`<div class="ht-next-game-venue">${n.venue}</div>` : ""}
      </div>
    ` : L``;
	}
	_renderSeriesNonActiveGame(e) {
		let t = this.config.logo_size ?? 64;
		if (e.game_state === "LIVE" && e.game_score) {
			let n = [e.game_period ? this._periodLabel(e.game_period) : "", e.game_clock || ""].filter(Boolean).join(" · ");
			return L`
        <div class="ht-scoreboard" style="border-top:none">
          <div class="ht-team">
            ${this._gameLogo(e.team1_logo_url, t)}
            <div class="ht-team-name">${e.team1_name || e.team1_abbrev || "TBD"}</div>
          </div>
          <div class="ht-mid">
            <div style="text-align:center">
              <div style="color:#c62828;font-size:0.65rem;font-weight:700;letter-spacing:0.05em">🔴 LIVE</div>
              <div class="ht-score" style="font-size:1.5rem">${e.game_score}</div>
              ${n ? L`<div class="ht-period" style="margin-top:2px">${n}</div>` : ""}
            </div>
          </div>
          <div class="ht-team">
            ${this._gameLogo(e.team2_logo_url, t)}
            <div class="ht-team-name">${e.team2_name || e.team2_abbrev || "TBD"}</div>
          </div>
        </div>
      `;
		}
		if (e.game_state === "FINAL" && e.game_score) return L`
        <div class="ht-scoreboard" style="border-top:none">
          <div class="ht-team">
            ${this._gameLogo(e.team1_logo_url, t)}
            <div class="ht-team-name">${e.team1_name || e.team1_abbrev || "TBD"}</div>
          </div>
          <div class="ht-mid">
            <div style="text-align:center">
              <div class="ht-score" style="font-size:1.5rem">${e.game_score}</div>
              <div class="ht-period">Final</div>
            </div>
          </div>
          <div class="ht-team">
            ${this._gameLogo(e.team2_logo_url, t)}
            <div class="ht-team-name">${e.team2_name || e.team2_abbrev || "TBD"}</div>
          </div>
        </div>
      `;
		if (e.game_state === "PRE" && e.game_start_time) return L`
        <div class="ht-next-game">
          <div class="ht-next-game-label">${this._isToday(e.game_start_time) ? "Today's Game" : "Next Game"}</div>
          ${this._seriesTeams(e.team1_logo_url, e.team1_name || e.team1_abbrev, e.team2_logo_url, e.team2_name || e.team2_abbrev)}
          <div class="ht-next-game-time">${this._fmtGameTime(e.game_start_time)}</div>
        </div>
      `;
		if (this.config.show_next_game !== !1) {
			let t = this._attr.next_game;
			if (t?.game_date) {
				let n = new Set([
					t.home_team_abbrev,
					t.away_team_abbrev,
					t.home_team_id,
					t.away_team_id
				].filter(Boolean).map(String)), r = [e.team1_id, e.team1_abbrev].filter(Boolean).map(String), i = [e.team2_id, e.team2_abbrev].filter(Boolean).map(String);
				if (r.some((e) => n.has(e)) && i.some((e) => n.has(e))) return L`
            <div class="ht-next-game">
              <div class="ht-next-game-label">Next Game</div>
              ${this._upcomingTeams(t.away_logo_url, t.away_team, t.home_logo_url, t.home_team)}
              <div class="ht-next-game-time">${this._fmtGameTime(t.game_date)}</div>
              ${t.venue ? L`<div class="ht-next-game-venue">${t.venue}</div>` : ""}
            </div>
          `;
			}
		}
		let n = this._seriesStatusLabel(e);
		return n ? L`<div class="hp-series-no-game-status">${n}</div>` : L``;
	}
	_gameLogo(e, t) {
		return this.config.show_logo === !1 ? L`` : e ? L`<img class="ht-logo" style="width:${t}px;height:${t}px" src="${e}" alt="" @error=${(e) => {
			e.target.style.display = "none";
		}}>` : L`<ha-icon class="ht-logo-icon" style="--mdc-icon-size:${t}px" icon="mdi:hockey-puck"></ha-icon>`;
	}
	_renderPlayoffEvents(e, t) {
		if (!this.config.show_events || !t) return L``;
		let n = (e.game_events || []).filter((e) => !(e.type === "goal" && this.config.show_event_goals === !1 || e.type === "penalty" && this.config.show_event_penalties === !1 || e.type === "shot" && this.config.show_event_shots === !1)).slice(0, this.config.events_count || 10);
		if (!n.length) return L``;
		let r = this.config.collapsible_events !== !1, i = r && this._eventsCollapsed;
		return L`
      <div class="ht-events">
        <div class="ht-section-header">
          <span class="ht-section-label">Game Events</span>
          ${r ? L`
            <ha-icon
              class="ht-collapse-btn"
              icon="${i ? "mdi:chevron-down" : "mdi:chevron-up"}"
              @click=${() => {
			this._eventsCollapsed = !this._eventsCollapsed;
		}}
            ></ha-icon>
          ` : ""}
        </div>
        ${i ? "" : n.map((e) => L`
            <div class="ht-event-row ${e.type === "goal" ? "ht-event-goal" : e.type === "shot" ? "ht-event-shot" : "ht-event-penalty"} ${e.is_tracked_team ? "ht-event--ours" : ""}">
              <span class="ht-event-dot"></span>
              <span class="ht-event-meta">P${e.period} ${e.time}</span>
              <span class="ht-event-abbrev">${e.team_abbrev}</span>
              <span class="ht-event-body">
                ${e.player_name}
                ${e.type === "goal" ? L`
                  ${e.is_power_play ? L`<span class="ht-event-tag">PP</span>` : ""}
                  ${e.is_short_handed ? L`<span class="ht-event-tag">SH</span>` : ""}
                  ${e.is_empty_net ? L`<span class="ht-event-tag">EN</span>` : ""}
                  ${e.assists?.length ? L`<span class="ht-event-assists"> · ${e.assists.join(", ")}</span>` : ""}
                ` : e.type === "shot" ? L`` : L`<span class="ht-event-assists">${e.description || ""} ${e.minutes ? `(${e.minutes} min)` : ""}</span>`}
              </span>
            </div>
          `)}
      </div>
    `;
	}
	async _refresh() {
		this.hass && this.config?.entity && await Se(this.hass, this.config.entity);
	}
	render() {
		if (!this.hass || !this.config?.entity) return L`<ha-card><div class="hp-content">Configure entity.</div></ha-card>`;
		let e = this._attr, t = this._view === "series" && this._selectedSeries;
		return L`
      <ha-card>
        <div class="hp-content">
          <div class="hp-header">
            ${this._badge()}
            <span class="hp-title">${t ? (this._selectedSeries.team1_abbrev || "?") + " vs " + (this._selectedSeries.team2_abbrev || "?") : this._title()}</span>
            <div class="hp-header-btns">
              <button
                class="hp-icon-btn ${t ? "" : "hp-icon-btn--active"}"
                title="Bracket view"
                @click=${() => {
			this._view = "bracket", this._selectedSeries = null;
		}}
              >🏒</button>
              <button class="hp-icon-btn" title="Refresh" @click=${this._refresh}>↻</button>
            </div>
          </div>
          ${this.config.show_last_updated === !1 ? "" : L`<div class="hp-last-updated">Updated ${this._timeAgo(e.last_fetched)}</div>`}
          ${t ? this._renderSeriesDetail(this._selectedSeries) : this._renderBracket()}
        </div>
      </ha-card>
    `;
	}
}), window.customCards = window.customCards || [];
for (let e of [{
	type: "hockey-tracker-card",
	name: "Hockey Tracker Card",
	description: "Live scores, schedule, and stats for any supported hockey league team.",
	version: Z,
	preview: !1,
	documentationURL: "https://github.com/linkian19/ha-hockey-tracker-card"
}, {
	type: "hockey-playoff-card",
	name: "Hockey Playoff Card",
	description: "Playoff bracket and live game view for followed teams across any supported league.",
	version: Z,
	preview: !1,
	documentationURL: "https://github.com/linkian19/ha-hockey-tracker-card"
}]) window.customCards.some((t) => t.type === e.type) || window.customCards.push(e);
be && console.info(`%c HOCKEY-TRACKER-CARD %c v${Z} `, "color: white; background: #1565c0; font-weight: 700;", "color: #1565c0; background: white; font-weight: 700;");
