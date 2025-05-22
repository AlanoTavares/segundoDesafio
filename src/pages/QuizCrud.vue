<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h5">Gerenciamento de Quiz</div>
      </q-card-section>

      <!-- Formulário -->
      <q-form @submit="salvarPergunta">
        <q-input filled v-model="form.pergunta" label="Pergunta" class="q-mb-md" />

        <div v-for="(resposta, index) in form.respostas" :key="index" class="row q-gutter-sm q-mb-sm">
          <q-input filled v-model="form.respostas[index]" :label="`Resposta ${index + 1}`" class="col" />
          <q-radio v-model="form.respostaCorreta" :val="index" label="Correta" class="self-center" />
        </div>

        <q-btn label="Adicionar Resposta" color="primary" @click="adicionarResposta" class="q-mb-md" />

        <div class="row q-gutter-sm">
          <q-btn label="Salvar" type="submit" color="primary" />
          <q-btn label="Limpar" color="warning" @click="limparForm" />
        </div>
      </q-form>

      <q-separator class="q-my-md" />

      <!-- Lista -->
      <q-card-section>
        <div class="text-h6">Perguntas Cadastradas</div>
        <q-list bordered>
          <q-item v-for="item in perguntas" :key="item.id">
            <q-item-section>
              <q-item-label class="text-bold">{{ item.pergunta }}</q-item-label>
              <q-item-label caption>
                <div v-for="(r, idx) in item.respostas" :key="idx">
                  <q-badge color="green" v-if="idx === item.respostaCorreta">Correta</q-badge>
                  {{ idx + 1 }}. {{ r }}
                </div>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn dense flat icon="edit" @click="editar(item)" />
              <q-btn dense flat icon="delete" color="negative" @click="excluir(item.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Estado do formulário
const form = ref({
  id: null,
  pergunta: '',
  respostas: ['', ''],
  respostaCorreta: 0
})

// Lista de perguntas
const perguntas = ref([])

// Referência da coleção
const colecao = collection(db, 'quiz')

// Função para buscar dados
const carregarDados = async () => {
  const querySnapshot = await getDocs(colecao)
  perguntas.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Salvar (criar ou atualizar)
const salvarPergunta = async () => {
  try {
    const payload = {
      pergunta: form.value.pergunta,
      respostas: form.value.respostas,
      respostaCorreta: form.value.respostaCorreta
    }

    if (form.value.id) {
      const docRef = doc(db, 'quiz', form.value.id)
      await updateDoc(docRef, payload)
      $q.notify({ type: 'positive', message: 'Pergunta atualizada!' })
    } else {
      await addDoc(colecao, payload)
      $q.notify({ type: 'positive', message: 'Pergunta salva!' })
    }

    limparForm()
    carregarDados()
  } catch (e) {
    console.error('Erro ao salvar:', e)
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  }
}

// Excluir
const excluir = async (id) => {
  try {
    await deleteDoc(doc(db, 'quiz', id))
    $q.notify({ type: 'positive', message: 'Excluído com sucesso!' })
    carregarDados()
  } catch (e) {
    console.error('Erro ao excluir:', e)
    $q.notify({ type: 'negative', message: 'Erro ao excluir' })
  }
}

// Editar (preencher formulário)
const editar = (item) => {
  form.value = {
    id: item.id,
    pergunta: item.pergunta,
    respostas: [...item.respostas],
    respostaCorreta: item.respostaCorreta
  }
}

// Adicionar campo de resposta
const adicionarResposta = () => {
  form.value.respostas.push('')
}

// Limpar formulário
const limparForm = () => {
  form.value = {
    id: null,
    pergunta: '',
    respostas: ['', ''],
    respostaCorreta: 0
  }
}

// Carregar ao iniciar
onMounted(() => {
  carregarDados()
})
</script>
