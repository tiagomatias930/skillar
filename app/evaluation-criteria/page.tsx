"use client";
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { motion } from "framer-motion";

// shadcn/ui components (assumed available in the user's project)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CRITERIA = [
  {
    key: "functional",
    title: "Correção Funcional",
    weight: 30,
    options: [
      { label: "Não funciona / incompleto", value: 0 },
      { label: "Funciona parcialmente, mas falha em casos básicos", value: 10 },
      { label: "Funciona corretamente nos casos normais", value: 20 },
      { label: "Funciona corretamente em casos normais e extremos", value: 30 },
    ],
  },
  {
    key: "quality",
    title: "Qualidade do Código",
    weight: 20,
    options: [
      { label: "Código confuso, difícil de entender", value: 0 },
      { label: "Estrutura mínima, mas pouco clara", value: 10 },
      { label: "Código claro, com funções bem definidas", value: 15 },
      { label: "Código muito bem organizado, modular e limpo", value: 20 },
    ],
  },
  {
    key: "performance",
    title: "Eficiência e Desempenho",
    weight: 20,
    options: [
      { label: "Ineficiente, trava com dados médios", value: 0 },
      { label: "Funciona, mas com gargalos de desempenho", value: 10 },
      { label: "Eficiente em casos médios", value: 15 },
      { label: "Eficiente até em casos grandes e extremos", value: 20 },
    ],
  },
  {
    key: "practices",
    title: "Boas Práticas e Padrões",
    weight: 15,
    options: [
      { label: "Sem padrões, tudo em main()", value: 0 },
      { label: "Alguma separação lógica", value: 5 },
      { label: "Uso adequado de modularização, funções e nomes claros", value: 10 },
      { label: "Aplicação consistente de boas práticas", value: 15 },
    ],
  },
  {
    key: "robust",
    title: "Tratamento de Erros e Robustez",
    weight: 10,
    options: [
      { label: "Não trata erros", value: 0 },
      { label: "Algum tratamento básico", value: 5 },
      { label: "Bom tratamento de erros e entradas inesperadas", value: 10 },
    ],
  },
  {
    key: "creativity",
    title: "Criatividade e Extensões",
    weight: 5,
    options: [
      { label: "Seguiu apenas o mínimo", value: 0 },
      { label: "Acrescentou melhorias úteis / extras", value: 5 },
    ],
  },
];

export default function AvaliacaoForm() {
  const [challengeName, setChallengeName] = useState("");
  const [candidate, setCandidate] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  // state for each criteria selected value
  type CriteriaKey = typeof CRITERIA[number]["key"];
  type Answers = Record<CriteriaKey, number | null>;
  const initialAnswers: Answers = CRITERIA.reduce((acc, c) => {
    acc[c.key as CriteriaKey] = null;
    return acc;
  }, {} as Answers);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  function setAnswer(key: CriteriaKey, value: string | number) {
    setAnswers((s) => ({ ...s, [key]: Number(value) }));
  }

  // compute weighted score and percentage
  const { totalPoints, percentage, grade, remark } = useMemo(() => {
    let obtained = 0;
    let maxPossible = 0;
    CRITERIA.forEach((c) => {
      const selected = answers[c.key as CriteriaKey];
      maxPossible += c.weight;
      if (selected !== null && selected !== undefined) {
        obtained += (selected / c.options[c.options.length - 1].value) * c.weight;
      }
    });

    // guard division
    const percent = maxPossible > 0 ? Math.round((obtained / maxPossible) * 100) : 0;

    let g = "Insuficiente";
    if (percent >= 90) g = "Excelente";
    else if (percent >= 75) g = "Muito Bom";
    else if (percent >= 60) g = "Bom";
    else if (percent >= 40) g = "Regular";

    let r = "";
    if (percent >= 90) r = "Ótimo: entregue produção pronta ou quase pronta.";
    else if (percent >= 75) r = "Muito bom: pequena otimizações faltando.";
    else if (percent >= 60) r = "Bom: atenção a testes e alguns edge-cases.";
    else if (percent >= 40) r = "Regular: precisa fortalecer qualidade e robustez.";
    else r = "Insuficiente: revisar arquitetura e correção.";

    return {
      totalPoints: Math.round(obtained),
      percentage: percent,
      grade: g,
      remark: r,
    };
  }, [answers]);

  function resetForm() {
    setChallengeName("");
    setCandidate("");
    setDate("");
    setNotes("");
    setAnswers(initialAnswers);
  }

  function exportCertificate() {
    if (!candidate || !challengeName || totalPoints <= 0) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [1200, 800] });

    // Fundo escuro
    doc.setFillColor(20, 22, 34);
    doc.rect(0, 0, 1200, 800, "F");

    // Linhas tech/cyber
    doc.setDrawColor(0, 255, 255);
    doc.setLineWidth(4);
    doc.line(40, 80, 1160, 80); // topo
    doc.line(40, 720, 1160, 720); // rodapé

    // Linhas decorativas (cantos)
    doc.setLineWidth(1.5);
    doc.line(40, 80, 40, 720);
    doc.line(1160, 80, 1160, 720);
    doc.setDrawColor(80, 200, 255);
    doc.line(40, 200, 400, 80);
    doc.line(1160, 200, 800, 80);
    doc.line(40, 600, 400, 720);
    doc.line(1160, 600, 800, 720);

    // Logo central translúcida
    const logoImg = new Image();
    logoImg.src = "/42skillar.png";
    logoImg.onload = function () {
      doc.addImage(logoImg, "PNG", 400, 180, 400, 400, undefined, "FAST");
      drawRest();
      doc.save(`certificado-${candidate}-${challengeName}.pdf`);
    };
    logoImg.onerror = function () {
      drawRest();
      doc.save(`certificado-${candidate}-${challengeName}.pdf`);
    };

    function drawRest() {
      // Logo e nome no topo
      doc.addImage(logoImg, "PNG", 80, 30, 100, 100, undefined, "FAST");
      doc.setTextColor(0, 255, 255);
      doc.setFontSize(48);
      doc.setFont("helvetica", "bold");
      doc.text("42Skillar", 210, 100);

      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");
      doc.text("Certificado de Desempenho", 600, 200, { align: "center" });

      // Certificamos que
      doc.setFontSize(32);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("Certificamos que", 600, 290, { align: "center" });

      // Nome do aluno
      doc.setFontSize(48);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 255, 255);
      doc.text(candidate, 600, 350, { align: "center" });

      // obteve destaque no desafio
      doc.setFontSize(32);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("obteve destaque no desafio", 600, 400, { align: "center" });

      // Nome do desafio
      doc.setFontSize(40);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 255, 255);
      doc.text(challengeName, 600, 460, { align: "center" });

      // Caixa de pontuação
      doc.setDrawColor(0, 255, 255);
      doc.setLineWidth(3);
      doc.roundedRect(450, 500, 300, 100, 12, 12);
      doc.setFontSize(32);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("Pontuação final:", 600, 540, { align: "center" });
      doc.setFontSize(48);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 255, 255);
      doc.text(`${totalPoints} pts`, 600, 590, { align: "center" });

      // Data e ícone
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 220, 255);
      const dataFormatada = date ? date.split("-").reverse().join("/") : "";
      doc.text(`Data: ${dataFormatada}`, 1050, 760, { align: "right" });
      // Pequeno ícone relógio (desenho simples)
      doc.setDrawColor(0, 255, 255);
      doc.setLineWidth(2);
      doc.circle(1080, 755, 12);
      doc.line(1080, 755, 1080, 748);
      doc.line(1080, 755, 1087, 755);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Formulário de Avaliação (Dinâmico)</CardTitle>
            <p className="text-sm text-muted-foreground">Avalie os desafios de C/C++ com cálculo automático.</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div>
                <Label className="mb-1">Nome do Desafio</Label>
                <Input value={challengeName} onChange={(e) => setChallengeName(e.target.value)} placeholder="Ex: Servidor HTTP Minimal" />
              </div>
              <div>
                <Label className="mb-1">Nome do Avaliado</Label>
                <Input value={candidate} onChange={(e) => setCandidate(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label className="mb-1">Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {CRITERIA.map((c) => (
            <Card key={c.key}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{c.title}</span>
                  <span className="text-sm text-muted-foreground">Peso: {c.weight}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <RadioGroup
                    value={answers[c.key as CriteriaKey] !== null && answers[c.key as CriteriaKey] !== undefined ? String(answers[c.key as CriteriaKey]) : ""}
                    onValueChange={(v: string) => setAnswer(c.key as CriteriaKey, v)}
                    className="flex flex-col gap-2"
                    name={c.key}
                  >
                    {c.options.map((opt, i) => (
                      <RadioGroupItem
                        key={i}
                        value={String(opt.value)}
                        label={opt.label}
                        checked={String(answers[c.key as CriteriaKey]) === String(opt.value)}
                        onChange={() => setAnswer(c.key as CriteriaKey, opt.value)}
                        name={c.key}
                      />
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Resumo & Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Notas / Observações</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Feedback curto para o candidato" />
              </div>

              <div>
                <Label>Resultado</Label>
                <div className="mt-3 space-y-3">
                  {Object.values(answers).some((v) => v === null) ? (
                    <div className="text-red-500 text-sm font-semibold">Preencha todos os critérios para ver o resultado final.</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Pontuação total (absoluta):</div>
                        <div className="font-semibold">{totalPoints.toFixed(0)} pts</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Percentual:</div>
                        <div className="font-semibold">{percentage}%</div>
                      </div>

                      <Progress value={percentage} />

                      <div className="pt-2">
                        <div className="text-sm">Classificação: <strong>{grade}</strong></div>
                        <div className="text-xs text-muted-foreground mt-1">{remark}</div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button onClick={exportCertificate} disabled={!candidate || !challengeName || totalPoints <= 0}>
                          Exportar Certificado PDF
                        </Button>
                        <Button variant="outline" onClick={resetForm}>Resetar</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-right text-sm text-muted-foreground">Gerado com shadcn/ui • Formulário dinâmico</div>
      </motion.div>
    </div>
  );
}















