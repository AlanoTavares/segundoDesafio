<template>
  <q-page class="q-pa-md flex flex-center">
    <!-- Pergunta atual -->
    <q-card
      v-if="perguntaAtual"
      class="q-pa-md"
      style="max-width: 600px; width: 100%"
    >
      <q-card-section>
        <div class="text-h6 text-center">{{ perguntaAtual.pergunta }}</div>
      </q-card-section>

      <q-card-section>
        <div v-for="(opcao, index) in perguntaAtual.respostas" :key="index">
          <q-item
            clickable
            :class="getClass(index)"
            @click="selecionarResposta(index)"
            :disable="respostaConfirmada"
          >
            <q-item-section>{{ opcao }}</q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultado final -->
    <q-card
      v-else
      class="q-pa-md text-center"
      style="max-width: 600px; width: 100%"
    >
      <q-card-section>
        <div class="text-h5">🎉 Fim do Quiz!</div>
        <div class="text-subtitle1 q-mt-md">
          Você acertou {{ acertos }} de {{ perguntas.length }} perguntas.
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn label="Recomeçar Quiz" color="primary" @click="recomecarQuiz" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "src/firebase";

const perguntas = ref([]);
const indiceAtual = ref(0);
const perguntaAtual = ref(null);
const respostaSelecionada = ref(null);
const respostaConfirmada = ref(false);
const acertos = ref(0);

// Carregar perguntas do Firestore
const carregarPerguntas = async () => {
  const snapshot = await getDocs(collection(db, "quiz"));
  perguntas.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  perguntaAtual.value = perguntas.value[indiceAtual.value];
};

// Selecionar uma opção e iniciar verificação automática
const selecionarResposta = (index) => {
  if (!respostaConfirmada.value) {
    respostaSelecionada.value = index;
    respostaConfirmada.value = true;

    const correta = perguntaAtual.value.respostaCorreta;
    if (index === correta) {
      acertos.value++;
    }

    // Avança automaticamente para a próxima pergunta em 2 segundos
    setTimeout(proximaPergunta, 2000);
  }
};

// Avançar para a próxima pergunta
const proximaPergunta = () => {
  respostaSelecionada.value = null;
  respostaConfirmada.value = false;
  indiceAtual.value++;
  if (indiceAtual.value < perguntas.value.length) {
    perguntaAtual.value = perguntas.value[indiceAtual.value];
  } else {
    perguntaAtual.value = null;
  }
};

// Recomeçar o quiz
const recomecarQuiz = () => {
  indiceAtual.value = 0;
  acertos.value = 0;
  respostaSelecionada.value = null;
  respostaConfirmada.value = false;
  perguntaAtual.value = perguntas.value[indiceAtual.value];
};

// Estilo das opções
const getClass = (index) => {
  const correta = perguntaAtual.value.respostaCorreta;

  if (respostaConfirmada.value) {
    if (index === correta) {
      return "bg-green-2 text-green-10 q-mb-sm";
    }
    if (index === respostaSelecionada.value) {
      return "bg-red-2 text-red-10 q-mb-sm";
    }
    return "q-mb-sm";
  }

  if (index === respostaSelecionada.value) {
    return "bg-grey-3 q-mb-sm";
  }

  return "q-mb-sm";
};

onMounted(() => {
  carregarPerguntas();
});
</script>

<style scoped>
.q-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  transition: opacity 0.3s ease;
}

.q-card-section .text-h6 {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.q-item {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.q-item:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

/* Resposta correta */
.bg-green-2 {
  background-color: #e6f4ea !important;
}

.text-green-10 {
  color: #1b5e20 !important;
}

/* Resposta errada */
.bg-red-2 {
  background-color: #fdecea !important;
}

.text-red-10 {
  color: #b71c1c !important;
}

/* Resposta selecionada (neutra) */
.bg-grey-3 {
  background-color: #f5f5f5 !important;
}

/* Botão de recomeçar */
.q-btn {
  border-radius: 24px;
  padding: 10px 24px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  background-color: #1976d2 !important;
  color: white !important;
}
</style>
