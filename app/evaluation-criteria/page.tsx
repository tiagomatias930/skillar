
"use client";
import AiEvaluationForm from "@/components/ai-evaluation-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AvaliacaoForm() {
	const [candidate, setCandidate] = useState("");
	const [challengeName, setChallengeName] = useState("");
	const [totalPoints, setTotalPoints] = useState(0);


	async function exportCertificate() {
		if (!candidate || !challengeName || totalPoints <= 0) return;

		// Importa pdf-lib dinamicamente para evitar problemas SSR
		const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

		// Carrega a imagem base do certificado
		const imageUrl = "/Generated Image September 15, 2025 - 6_54PM.png";
		const imageResponse = await fetch(imageUrl);
		const imageBytes = await imageResponse.arrayBuffer();

		// Cria um novo documento PDF
		const pdfDoc = await PDFDocument.create();
		// Adiciona uma página com tamanho aproximado da imagem
		const page = pdfDoc.addPage([1280, 905]); // ajuste conforme o tamanho real da imagem

		// Adiciona a imagem como fundo
		const pngImage = await pdfDoc.embedPng(imageBytes);
		page.drawImage(pngImage, {
			x: 0,
			y: 0,
			width: 1280,
			height: 905,
		});

		// Fonte para os textos
		const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

		// Escreve o nome do candidato (ajuste as coordenadas conforme necessário)
		page.drawText(candidate, {
			x: 320, // ajuste para alinhar com "FULANO DE TAL"
			y: 520, // ajuste para alinhar com "FULANO DE TAL"
			size: 36,
			font,
			color: rgb(0, 0, 0),
		});

		// Escreve o nome do desafio (ajuste as coordenadas conforme necessário)
		page.drawText(challengeName, {
			x: 320, // ajuste para alinhar com "NOME DESASIO TECNOLOGICO"
			y: 470, // ajuste para alinhar com "NOME DESASIO TECNOLOGICO"
			size: 28,
			font,
			color: rgb(0, 0, 0),
		});

		// Gera o PDF e faz o download
		const pdfBytes = Uint8Array.from(await pdfDoc.save());
		const blob = new Blob([pdfBytes], { type: "application/pdf" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `certificado-${candidate}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	return (
		<div className="max-w-xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 text-center">Avaliação</h1>
			<p className="mb-6 text-gray-600 text-center">
				Submeta o link do repositório, commit e informações do desafio para receber uma avaliação automática do seu projeto por IA.
			</p>
			<AiEvaluationForm />

			<div className="flex flex-col gap-2 mt-8">
				<input
					type="text"
					placeholder="Nome do candidato"
					value={candidate}
					onChange={e => setCandidate(e.target.value)}
					className="border rounded px-2 py-1"
				/>
				<input
					type="text"
					placeholder="Nome do desafio"
					value={challengeName}
					onChange={e => setChallengeName(e.target.value)}
					className="border rounded px-2 py-1"
				/>
				<input
					type="number"
					placeholder="Total de pontos"
					value={totalPoints}
					onChange={e => setTotalPoints(Number(e.target.value))}
					className="border rounded px-2 py-1"
				/>
				<Button onClick={exportCertificate} className="mt-2">Exportar Certificado</Button>
			</div>
		</div>
	);
}



{/*vaz pegar a imagem que esta na /public/Generated como base e espelho de como vai ser o certificado que vai ser gerado, os dados que vão aparecer no certificado já estão bem especificados
na imagem. Enquanto isso estou a trabalhar num interface mais soft para esta page*/}