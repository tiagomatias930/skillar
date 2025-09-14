"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"

export default function EvaluationCriteriaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Formulário Universal de Avaliação – Desafios de Programação</CardTitle>
            <CardDescription>
              Avalie qualquer desafio com critérios claros e objetivos. Pontuação máxima: 100 pontos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="font-bold text-lg mb-2">1. Correção Funcional (30%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O programa resolve o problema proposto?</li>
                <li>[ ] Não funciona / incompleto (0 pts)</li>
                <li>[ ] Funciona parcialmente, mas falha em casos básicos (10 pts)</li>
                <li>[ ] Funciona corretamente nos casos normais (20 pts)</li>
                <li>[ ] Funciona corretamente em casos normais <b>e extremos</b> (30 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">2. Qualidade do Código (20%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O código é legível e bem estruturado?</li>
                <li>[ ] Código confuso, difícil de entender (0 pts)</li>
                <li>[ ] Estrutura mínima, mas pouco clara (10 pts)</li>
                <li>[ ] Código claro, com funções bem definidas (15 pts)</li>
                <li>[ ] Código muito bem organizado, modular e limpo (20 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">3. Eficiência e Desempenho (20%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O programa é eficiente em uso de CPU/memória?</li>
                <li>[ ] Ineficiente, trava com dados médios (0 pts)</li>
                <li>[ ] Funciona, mas com gargalos de desempenho (10 pts)</li>
                <li>[ ] Eficiente em casos médios (15 pts)</li>
                <li>[ ] Eficiente até em casos grandes e extremos (20 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">4. Boas Práticas e Padrões (15%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O desenvolvedor aplica boas práticas?</li>
                <li>[ ] Sem padrões, tudo em <code>main()</code> (0 pts)</li>
                <li>[ ] Alguma separação lógica (5 pts)</li>
                <li>[ ] Uso adequado de modularização, funções e nomes claros (10 pts)</li>
                <li>[ ] Aplicação consistente de boas práticas (15 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">5. Tratamento de Erros e Robustez (10%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O programa lida com entradas inválidas ou imprevistos?</li>
                <li>[ ] Não trata erros (0 pts)</li>
                <li>[ ] Algum tratamento básico (5 pts)</li>
                <li>[ ] Bom tratamento de erros e entradas inesperadas (10 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">6. Criatividade e Extensões (5%)</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>O programador foi além do pedido?</li>
                <li>[ ] Seguiu apenas o mínimo (0 pts)</li>
                <li>[ ] Acrescentou melhorias úteis / extras (5 pts)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">Cálculo da Nota Final</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>Nota = Soma dos Pontos (máx. 100)</li>
                <li><b>90 – 100:</b> Excelente</li>
                <li><b>75 – 89:</b> Muito Bom</li>
                <li><b>60 – 74:</b> Bom, mas pode melhorar</li>
                <li><b>40 – 59:</b> Regular, precisa de ajustes</li>
                <li><b>0 – 39:</b> Insuficiente</li>
              </ul>
            </section>
            <div className="mt-8 text-center">
              <Link href="/" passHref>
                <Button variant="outline">Voltar para o início</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
