const _g = (id) => document.getElementById(id);
let buyingAlone = "Não";
const MAX_PARTICIPANT_PHONES = 10;

function showBeforeStart() {
  _g("stepIntro").classList.remove("active");
  _g("stepBeforeStart").classList.add("active");
  window.scrollTo(0, 0);
}

function startSimulation() {
  _g("stepBeforeStart").classList.remove("active");
  _g("step1").classList.add("active");
  window.scrollTo(0, 0);
}

// --- MÁSCARAS ---
// Máscara de Data
function _mDt(v) {
  let x = v.value.replace(/\D/g, "");
  if (x.length > 2) x = x.replace(/^(\d{2})(\d)/, "$1/$2");
  if (x.length > 5) x = x.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  v.value = x;
  if (x.length === 10) {
    if (validarData(x)) {
      _g("err-nasc").style.display = "none";
      setTimeout(() => nextStep(1), 600);
    } else {
      _g("err-nasc").style.display = "block";
    }
  }
}

// Máscara Monetária
function _fM(i) {
  var v = i.value.replace(/\D/g, "");
  v = (v / 100)
    .toFixed(2)
    .replace(".", ",")
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  i.value = "R$ " + v;
}

// Máscara de telefone celular/fixo
function _mPhone(i) {
  let v = i.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (v.length > 0) {
    v = v.replace(/^(\d{0,2})/, "($1");
  }
  i.value = v;
}

function getMoneyCents(id) {
  const el = _g(id);
  return el ? parseInt((el.value || "").replace(/\D/g, ""), 10) || 0 : 0;
}

// --- VALIDAÇÕES DE CAMPOS ---
function checkRenda() {
  const valStr = _g("rnd").value.replace(/\D/g, "");
  const val = parseFloat(valStr) / 100;
  // Aviso para valores abaixo do salário mínimo (referência 2025/2026 aprox)
  _g("warn-rnd").style.display = val > 0.01 && val < 1621.0 ? "block" : "none";
}

function checkIRDate() {
  const field = _g("air");
  if (!field.value) {
    _g("warn-ir-date").style.display = "none";
    return true;
  }

  const val = parseInt(field.value);
  const warn = _g("warn-ir-date");
  const now = new Date();
  const currentYear = now.getFullYear();
  const limitDate = new Date(currentYear, 2, 15); // Prazo de início do IR (15 de Março)

  let isValid = true;
  let message = "";

  if (val > currentYear) {
    isValid = false;
    message = "Não é possível informar declaração de ano superior ao atual.";
  } else if (val === currentYear && now < limitDate) {
    isValid = false;
    message = "A declaração de imposto deste ano informado ainda não começou.";
  }

  if (!isValid) {
    warn.style.display = "block";
    warn.innerText = message;
  } else {
    warn.style.display = "none";
  }
  return isValid;
}

function checkEntrada() {
  const fgtsCents = getMoneyCents("fgts");
  const entradaCents = getMoneyCents("ent");
  const zeroMsg = _g("err-entrada-zero");
  const confirmCont = _g("entrada-fgts-confirm-cont");
  const confirmCheck = _g("entrada-fgts-confirm");
  const entradaEqualsFGTS =
    entradaCents > 0 && fgtsCents > 0 && entradaCents === fgtsCents;

  if (zeroMsg) zeroMsg.style.display = entradaCents === 0 ? "block" : "none";
  if (confirmCont)
    confirmCont.style.display = entradaEqualsFGTS ? "flex" : "none";
  if (!entradaEqualsFGTS && confirmCheck) confirmCheck.checked = false;

  updateStep6ContinueButton();
}

function isEntradaReady() {
  const fgtsCents = getMoneyCents("fgts");
  const entradaCents = getMoneyCents("ent");
  const confirmCheck = _g("entrada-fgts-confirm");
  const entradaEqualsFGTS =
    entradaCents > 0 && fgtsCents > 0 && entradaCents === fgtsCents;

  if (entradaCents === 0) return false;
  if (entradaEqualsFGTS && (!confirmCheck || !confirmCheck.checked))
    return false;
  return true;
}

function isDebtReady() {
  const debt = _g("div") ? _g("div").value : "";
  const knowDebt = _g("sdiv") ? _g("sdiv").value : "";
  if (debt === "") return false;
  if (debt === "Sim") return knowDebt === "Sim";
  return true;
}

function updateStep6ContinueButton() {
  const btn = _g("btn-step6");
  if (!btn) return;
  btn.disabled = !(isEntradaReady() && isDebtReady());
}

function handleFGTSChange() {
  const hasFGTS = getMoneyCents("fgts") > 0;
  const cont = _g("tfg-cont");
  const tfg = _g("tfg");
  if (!cont || !tfg) return;

  cont.style.display = hasFGTS ? "block" : "none";
  if (!hasFGTS) tfg.value = "";
  checkEntrada();
}

function handleDebtChange() {
  const debt = _g("div").value;
  const cont = _g("debt-value-cont");
  const knowDebt = _g("sdiv");
  const err = _g("err-debt-value");

  if (debt === "Sim") {
    cont.style.display = "block";
    err.style.display = knowDebt.value === "Não" ? "block" : "none";
  } else {
    cont.style.display = "none";
    knowDebt.value = "";
    err.style.display = "none";
  }

  updateStep6ContinueButton();
}

function handleDebtValueChange() {
  const debt = _g("div").value;
  const knowDebt = _g("sdiv").value;
  const err = _g("err-debt-value");

  if (debt === "Sim") {
    err.style.display = knowDebt === "Não" ? "block" : "none";
  } else {
    err.style.display = "none";
  }

  updateStep6ContinueButton();
}

function addParticipantPhoneField() {
  const fields = _g("participant-phone-fields");
  if (!fields) return;

  const rows = fields.querySelectorAll(".phone-row");
  if (rows.length >= MAX_PARTICIPANT_PHONES) {
    updateParticipantPhoneButtons();
    return;
  }

  const row = document.createElement("div");
  row.className = "phone-row";
  row.innerHTML = `
        <input type="tel" class="participant-phone" placeholder="(31) 99999-9999" maxlength="15" inputmode="tel" autocomplete="tel">
        <button type="button" class="btn-add-phone" aria-label="Adicionar outro telefone">+</button>
    `;
  fields.appendChild(row);
  updateParticipantPhoneButtons();
}

function updateParticipantPhoneButtons() {
  const fields = _g("participant-phone-fields");
  const limitMsg = _g("phone-limit-msg");
  if (!fields) return;

  const rows = fields.querySelectorAll(".phone-row");
  const limitReached = rows.length >= MAX_PARTICIPANT_PHONES;
  fields
    .querySelectorAll(".btn-add-phone")
    .forEach((btn) => (btn.disabled = limitReached));
  if (limitMsg) limitMsg.style.display = limitReached ? "block" : "none";
}

function ensureParticipantPhoneField() {
  const fields = _g("participant-phone-fields");
  if (fields && fields.querySelectorAll(".phone-row").length === 0)
    addParticipantPhoneField();
}

function updateParticipantPhonesVisibility() {
  const section = _g("participants-phone-section");
  if (!section) return;

  if (buyingAlone === "Não") {
    section.style.display = "block";
    ensureParticipantPhoneField();
  } else {
    section.style.display = "none";
  }
}

function getParticipantPhones() {
  const inputs = document.querySelectorAll(".participant-phone");
  return Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((value) => value !== "")
    .slice(0, MAX_PARTICIPANT_PHONES);
}

function formatPhonesForWhatsApp(phones) {
  if (!phones.length) return "Não informado";

  const lines = [];
  for (let i = 0; i < phones.length; i += 2) {
    lines.push(phones.slice(i, i + 2).join(" | "));
  }
  return lines.join("\n");
}

function getDocumentQuestion(ec) {
  if (ec === "Casado(a)") return "Possui cópia da Certidão de Casamento?";
  if (ec === "Separado(a)") return "Separação averbada na Certidão?";
  if (ec === "Divorciado(a)") return "Divórcio averbado na Certidão?";
  if (ec === "Viúvo(a)") return "Viuvez averbada na Certidão?";
  if (ec === "União Estável") return "Possui documento dessa união?";
  return "Documentação do estado civil?";
}

function validarData(data) {
  const p = data.split("/");
  const d = parseInt(p[0], 10),
    m = parseInt(p[1], 10) - 1,
    a = parseInt(p[2], 10);
  const dt = new Date(a, m, d);
  return (
    dt.getDate() === d && dt.getMonth() === m && dt < new Date() && a > 1920
  );
}

// --- LÓGICA DE ESTADO CIVIL (RECUPERADA) ---
function handleECChange() {
  const ec = _g("ec").value,
    container = _g("dynamic-ec");
  if (ec === "Solteiro(a)") {
    container.innerHTML = `<div class='sub-info'><label>Comprar sozinho?</label><select id='cs'><option value='' disabled selected>Selecione...</option><option value='Sim'>Sim</option><option value='Não'>Não</option></select></div>`;
  } else if (ec !== "") {
    let msg = "";
    if (ec === "Casado(a)") msg = "Possui cópia da Certidão de Casamento?";
    else if (ec === "Separado(a)") msg = "Separação averbada na Certidão?";
    else if (ec === "Divorciado(a)") msg = "Divórcio averbado na Certidão?";
    else if (ec === "Viúvo(a)") msg = "Viuvez averbada na Certidão?";
    else if (ec === "União Estável") msg = "Possui documento dessa união?";
    container.innerHTML = `<div class='sub-info'>${msg}<select id='sub_q'><option value='' disabled selected>Selecione...</option><option value='Sim'>Sim</option><option value='Não'>Não</option></select></div>`;
  } else {
    container.innerHTML = "";
  }
}

function updateExtraStep() {
  const ec = _g("ec").value,
    sub = _g("sub_q") ? _g("sub_q").value : null,
    content = _g("extra-content");
  if (ec === "Casado(a)") {
    content.innerHTML = `
            <div class="f-g">
                <label>Qual é o regime de comunhão de bens?</label>
                <select id="regime">
                    <option value="">Selecione...</option>
                    <option value="União Parcial">Comunhão Parcial</option>
                    <option value="União Total">Comunhão Universal (Total)</option>
                    <option value="Separação Total">Separação Total de Bens</option>
                </select>
            </div>
            <div id="regime-extra"></div>`;
  } else if (
    ["Separado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"].includes(ec)
  ) {
    if (sub === "Não") {
      content.innerHTML = `<div class="alert-box"><strong>Atenção:</strong> É necessário regularizar a averbação do seu estado civil na certidão para prosseguir com o financiamento individual.<br><br>Por enquanto, os dados serão considerados para análise de compra em conjunto.</div><p>Clique em continuar para prosseguir.</p>`;
      buyingAlone = "Não";
    } else {
      content.innerHTML = `<div class="f-g"><label>Deseja comprar sozinho(a)?</label><select id="cs_extra"><option value="" disabled selected>Selecione...</option><option value="Sim">Sim</option><option value="Não">Não</option></select></div>`;
    }
  }
}

function handleRegimeChange() {
  const r = _g("regime").value,
    extra = _g("regime-extra");
  if (r === "Separação Total") {
    extra.innerHTML = `<div class="f-g"><label>Deseja comprar sozinho(a)?</label><select id="cs_regime"><option value="" disabled selected>Selecione...</option><option value="Sim">Sim</option><option value="Não">Não</option></select></div>`;
  } else {
    extra.innerHTML = `<div class="sub-info">Neste regime, a compra deve obrigatoriamente ser realizada pelo casal.</div>`;
    buyingAlone = "Não";
  }
}

// --- NAVEGAÇÃO ENTRE PASSOS ---
function nextStep(c) {
  if (c === 2) {
    if (_g("ec").value === "") return alert("Selecione o Estado Civil.");
    if (_g("ec").value === "Solteiro(a)") {
      if (!_g("cs") || _g("cs").value === "")
        return alert("Selecione se deseja comprar sozinho.");
      buyingAlone = _g("cs").value;
      _g("step2").classList.remove("active");
      _g("step3").classList.add("active");
      return;
    }
    if (_g("sub_q") && _g("sub_q").value === "")
      return alert("Responda sobre a documentação.");
    updateExtraStep();
    _g("step2").classList.remove("active");
    _g("stepExtra").classList.add("active");
  } else if (c === "Extra") {
    if (_g("regime") && _g("regime").value === "")
      return alert("Selecione o regime de bens.");
    if (_g("cs_regime")) {
      if (_g("cs_regime").value === "")
        return alert("Selecione se deseja comprar sozinho(a).");
      buyingAlone = _g("cs_regime").value;
    } else if (_g("cs_extra")) {
      if (_g("cs_extra").value === "")
        return alert("Selecione se deseja comprar sozinho(a).");
      buyingAlone = _g("cs_extra").value;
    }
    _g("stepExtra").classList.remove("active");
    _g("step3").classList.add("active");
  } else if (c === 3) {
    if (_g("rnd").value.replace(/\D/g, "") === "000")
      return alert("Informe a Renda Bruta.");
    if (_g("tr").value === "") return alert("Selecione o Tipo de Renda.");
    _g(`step${c}`).classList.remove("active");
    _g(`step${c + 1}`).classList.add("active");
  } else if (c === 4) {
    if (_g("dir").value === "") return alert("Selecione se declarou IR.");
    if (_g("dir").value === "Sim") {
      if (!_g("air").value) return alert("Informe o ano da última declaração.");
      if (!checkIRDate())
        return alert(
          "O ano de declaração informado é inválido. Não é possível continuar.",
        );
    }
    _g(`step${c}`).classList.remove("active");
    _g(`step${c + 1}`).classList.add("active");
  } else if (c === 5) {
    if (getMoneyCents("fgts") > 0 && _g("tfg").value === "")
      return alert("Selecione a opção sobre tempo de FGTS.");
    _g(`step${c}`).classList.remove("active");
    _g(`step${c + 1}`).classList.add("active");
    checkEntrada();
  } else if (c === 6) {
    checkEntrada();
    if (getMoneyCents("ent") === 0)
      return alert("Informe um valor - não é o do FGTS.");
    if (!isEntradaReady())
      return alert("Confirme que o valor informado não é o valor do FGTS.");
    if (_g("div").value === "") return alert("Selecione se possui dívidas.");
    if (_g("div").value === "Sim") {
      if (_g("sdiv").value === "")
        return alert("Responda se deseja saber o valor das suas dívidas.");
      if (_g("sdiv").value === "Não") {
        handleDebtValueChange();
        return;
      }
    }
    if (buyingAlone === "Não") {
      updateParticipantPhonesVisibility();
      _g(`step${c}`).classList.remove("active");
      _g("stepPhones").classList.add("active");
    } else {
      _g(`step${c}`).classList.remove("active");
      _g("step7").classList.add("active");
    }
  } else if (c === "Phones") {
    _g("stepPhones").classList.remove("active");
    _g("step7").classList.add("active");
  } else {
    _g(`step${c}`).classList.remove("active");
    _g(`step${c + 1}`).classList.add("active");
  }
  window.scrollTo(0, 0);
}

function prevStep(c) {
  if (c === 3) {
    if (_g("ec").value === "Solteiro(a)") {
      _g("step3").classList.remove("active");
      _g("step2").classList.add("active");
    } else {
      _g("step3").classList.remove("active");
      _g("stepExtra").classList.add("active");
    }
  } else if (c === "Extra") {
    _g("stepExtra").classList.remove("active");
    _g("step2").classList.add("active");
  } else if (c === "Phones") {
    _g("stepPhones").classList.remove("active");
    _g("step6").classList.add("active");
  } else if (c === 7) {
    _g("step7").classList.remove("active");
    if (buyingAlone === "Não") {
      _g("stepPhones").classList.add("active");
    } else {
      _g("step6").classList.add("active");
    }
  } else {
    _g(`step${c}`).classList.remove("active");
    _g(`step${c - 1}`).classList.add("active");
  }
  window.scrollTo(0, 0);
}

function handleIRChange() {
  _g("ir-ano-cont").style.display =
    _g("dir").value === "Sim" ? "block" : "none";
}

// --- GERAÇÃO DE PDF E REDIRECIONAMENTO WHATSAPP ---
function _zRun() {
  const fgtsVal = _g("fgts").value.trim() === "" ? "R$ 0,00" : _g("fgts").value;
  const entVal = _g("ent").value.trim() === "" ? "R$ 0,00" : _g("ent").value;
  const fgtsCents = getMoneyCents("fgts");
  const participantPhones = buyingAlone === "Não" ? getParticipantPhones() : [];

  const d = {
    n: _g("nasc").value,
    c: _g("ec").value,
    reg: _g("regime") ? _g("regime").value : "--",
    sub: _g("sub_q") ? _g("sub_q").value : "--",
    sozinho: buyingAlone,
    r: _g("rnd").value,
    t: _g("tr").value,
    ir: _g("dir").value,
    a: _g("air").value || "--",
    f: fgtsVal,
    e: entVal,
    tf:
      fgtsCents > 0
        ? _g("tfg").value || "--"
        : "Não aplicável (saldo de FGTS zerado)",
    dv: _g("div").value,
    sdv: _g("sdiv") ? _g("sdiv").value || "--" : "--",
    tels: participantPhones,
  };

  // 1. Criar PDF Profissional
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cabeçalho Azul
  doc.setFillColor(0, 86, 179);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DADOS PARA SIMULAÇÃO", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Declaro esses dados verdadeiros.", pageWidth / 2, 28, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    37,
    { align: "center" },
  );

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  let y = 65;
  const printRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value), pageWidth - 125);
    doc.text(lines, 105, y);
    const rowHeight = Math.max(12, lines.length * 6 + 6);
    doc.setDrawColor(230, 230, 230);
    doc.line(20, y + rowHeight - 8, pageWidth - 20, y + rowHeight - 8);
    y += rowHeight;
  };

  // Sessões do PDF
  doc.setFontSize(14);
  doc.setTextColor(0, 86, 179);
  doc.text("DADOS DO PROPONENTE", 20, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  printRow("Data de Nascimento:", d.n);
  printRow("Estado Civil:", d.c);
  if (d.reg !== "--") printRow("Regime de Bens:", d.reg);
  if (d.sub !== "--") printRow(getDocumentQuestion(d.c), d.sub);
  printRow("Comprar Sozinho(a)?:", d.sozinho);
  if (d.sozinho === "Não")
    printRow(
      "Telefones dos Participantes:",
      d.tels.length ? d.tels.join(", ") : "Não informado",
    );
  y += 5;

  doc.setFontSize(14);
  doc.setTextColor(0, 86, 179);
  doc.text("DADOS FINANCEIROS", 20, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  printRow("Renda Bruta:", d.r);
  printRow("Tipo de Renda:", d.t);
  printRow("Declarou IR?:", d.ir);
  if (d.ir === "Sim") printRow("Ano Declarado:", d.a);
  y += 5;

  doc.setFontSize(14);
  doc.setTextColor(0, 86, 179);
  doc.text("RECURSOS E CRÉDITO", 20, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  printRow("Saldo de FGTS Pessoal:", d.f);
  printRow("Mais de 3 anos de FGTS?:", d.tf);
  printRow("Valor Disponível (entrada/ato):", d.e);
  printRow("Possui Dívidas/Acordos?:", d.dv);
  if (d.dv === "Sim") printRow("Deseja saber o valor das dívidas?:", d.sdv);

  // Rodapé de Identificação
  doc.setDrawColor(0, 86, 179);
  doc.line(20, pageHeight - 35, pageWidth - 20, pageHeight - 35);
  doc.setFontSize(14);
  doc.setTextColor(0, 86, 179);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Roger Oliveira - Consultor Imobiliário",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" },
  );
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Creci-MG 45.117 | WhatsApp (31) 93618-0070",
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" },
  );

  const pdfName = `Simulacao_${d.n.replace(/\//g, "-")}.pdf`;
  doc.save(pdfName);

  // 2. Redirecionar para WhatsApp com Resumo
  const ph = "5531936180070";
  let texto = `*DADOS PARA SIMULAÇÃO DE FINANCIAMENTO*
Declaro verdadeiras as informações

`;
  texto += `*DADOS PESSOAIS*
`;
  texto += `Data de Nascimento: ${d.n}
`;
  texto += `Estado Civil: ${d.c}
`;
  if (d.reg !== "--")
    texto += `Qual é o regime de comunhão de bens?: ${d.reg}
`;
  if (d.sub !== "--")
    texto += `${getDocumentQuestion(d.c)}: ${d.sub}
`;
  texto += `Comprar sozinho(a)?: ${d.sozinho}
`;
  if (d.sozinho === "Não") {
    texto += `Telefone das pessoas que vão participar da simulação:
${formatPhonesForWhatsApp(d.tels)}
`;
  }
  texto += `
*FINANCEIRO*
`;
  texto += `Renda Bruta Pessoal: ${d.r}
`;
  texto += `Tipo de Renda: ${d.t}
`;
  texto += `Declarou Imposto de Renda (IRPF/IRPJ)?: ${d.ir}
`;
  if (d.ir === "Sim")
    texto += `Ano da Última Declaração: ${d.a}
`;
  texto += `
*RECURSOS E CRÉDITO*
`;
  texto += `Saldo de FGTS Pessoal?: ${d.f}
`;
  texto += `Mais de 3 anos de contribuição no FGTS?: ${d.tf}
`;
  texto += `Valor Disponível (entrada/ato)?: ${d.e}
`;
  texto += `Possui Dívidas / Acordos / Negociações?: ${d.dv}
`;
  if (d.dv === "Sim")
    texto += `Deseja saber o valor das suas dívidas?: ${d.sdv}
`;
  texto += `
_Um PDF detalhado foi gerado e baixado no meu dispositivo._`;

  const msg = encodeURIComponent(texto);
  setTimeout(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    window.open(
      isMobile
        ? `https://wa.me/${ph}?text=${msg}`
        : `https://web.whatsapp.com/send?phone=${ph}&text=${msg}`,
      "_blank",
    );
  }, 1000);
}

function parseStepValue(value) {
  return /^\d+$/.test(value) ? Number(value) : value;
}

function handleDocumentClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "show-before-start") {
    showBeforeStart();
    return;
  }

  if (button.dataset.action === "start-simulation") {
    startSimulation();
    return;
  }

  if (button.dataset.action === "submit-simulation") {
    _zRun();
    return;
  }

  if (button.dataset.next) {
    nextStep(parseStepValue(button.dataset.next));
    return;
  }

  if (button.dataset.prev) {
    prevStep(parseStepValue(button.dataset.prev));
    return;
  }

  if (button.classList.contains("btn-add-phone")) {
    addParticipantPhoneField();
  }
}

function handleDocumentInput(event) {
  const el = event.target;

  if (el.id === "nasc") {
    _mDt(el);
    return;
  }

  if (el.id === "rnd") {
    _fM(el);
    checkRenda();
    return;
  }

  if (el.id === "air") {
    checkIRDate();
    return;
  }

  if (el.id === "fgts") {
    _fM(el);
    handleFGTSChange();
    return;
  }

  if (el.id === "ent") {
    _fM(el);
    checkEntrada();
    return;
  }

  if (el.classList.contains("participant-phone")) {
    _mPhone(el);
  }
}

function handleDocumentChange(event) {
  const el = event.target;

  if (el.id === "ec") {
    handleECChange();
    return;
  }

  if (el.id === "dir") {
    handleIRChange();
    return;
  }

  if (el.id === "entrada-fgts-confirm") {
    updateStep6ContinueButton();
    return;
  }

  if (el.id === "div") {
    handleDebtChange();
    return;
  }

  if (el.id === "sdiv") {
    handleDebtValueChange();
    return;
  }

  if (el.id === "regime") {
    handleRegimeChange();
  }
}

function handleDocumentBlur(event) {
  const el = event.target;

  if (el.id === "rnd") checkRenda();
  if (el.id === "fgts") handleFGTSChange();
  if (el.id === "ent") checkEntrada();
}

function bindEvents() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleDocumentInput);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("blur", handleDocumentBlur, true);
}

// Inicializar scripts ao carregar
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  handleFGTSChange();
  handleDebtChange();
  checkEntrada();
});
