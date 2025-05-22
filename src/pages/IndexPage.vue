<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h5">Gerenciar Quiz</div>
      </q-card-section>

      <!-- Formulário -->
      <q-form @submit.prevent="salvarPergunta">
        <q-input v-model="form.pergunta" label="Pergunta" filled class="q-mb-md" />

        <div v-for="(resposta, index) in form.respostas" :key="index" class="row q-gutter-sm q-mb-sm">
          <q-input v-model="form.respostas[index]" :label="`Resposta ${index + 1}`" filled class="col" />
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
        <q-list bordered separator>
          <q-item v-for="item in perguntas" :key="item.id">
            <q-item-section>
              <q-item-label class="text-bold">{{ item.pergunta }}</q-item-label>
              <q-item-label caption>
                <div v-for="(r, idx) in item.respostas" :key="idx">
                  <q-badge color="green" v-if="idx === item.respostaCorreta" class="q-mr-sm">
                    Correta
                  </q-badge>
                  {{ idx + 1 }}. {{ r }}
                </div>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn dense flat icon="edit" @click="editar(item)" />
              <q-btn dense flat icon="delete" color="negative" @click="confirmarExclusao(item)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from 'src/firebase'

const $q = useQuasar()

// Referência da coleção
const colecao = collection(db, 'quiz')

// Formulário
const form = ref({
  id: null,
  pergunta: '',
  respostas: ['', ''],
  respostaCorreta: 0
})

// Lista de perguntas
const perguntas = ref([])

// Carregar dados
const carregarDados = async () => {
  const snapshot = await getDocs(colecao)
  perguntas.value = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }))
}

// Salvar (criar ou atualizar)
const salvarPergunta = async () => {
  if (!form.value.pergunta.trim()) {
    $q.notify({ type: 'warning', message: 'Informe a pergunta.' })
    return
  }
  if (form.value.respostas.some(r => !r.trim())) {
    $q.notify({ type: 'warning', message: 'Preencha todas as respostas.' })
    return
  }

  const payload = {
    pergunta: form.value.pergunta,
    respostas: form.value.respostas,
    respostaCorreta: form.value.respostaCorreta
  }

  try {
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
  } catch (error) {
    console.error('Erro ao salvar:', error)
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  }
}

// Editar
const editar = (item) => {
  form.value = {
    id: item.id,
    pergunta: item.pergunta,
    respostas: [...item.respostas],
    respostaCorreta: item.respostaCorreta
  }
}

// Confirmar exclusão
const confirmarExclusao = (item) => {
  $q.dialog({
    title: 'Confirmação',
    message: 'Deseja excluir esta pergunta?',
    ok: {
      label: 'Sim',
      color: 'negative'
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary'
    },
    persistent: true
  })
    .onOk(() => {
      excluir(item.id)
    })
    .onCancel(() => {
      console.log('Exclusão cancelada')
    })
    .onDismiss(() => {
      console.log('Dialog fechado')
    })
}


// Excluir
const excluir = async (id) => {
  try {
    await deleteDoc(doc(db, 'quiz', id))
    $q.notify({ type: 'positive', message: 'Excluído com sucesso!' })
    carregarDados()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    $q.notify({ type: 'negative', message: 'Erro ao excluir' })
  }
}

// Adicionar resposta extra
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

// Ao montar
onMounted(() => {
  carregarDados()
})
</script>
