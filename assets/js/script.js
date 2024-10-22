const form = document.getElementById("form");

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();

  const result = document.getElementById("result");
  const loadingElement = document.createElement("div");
  loadingElement.id = "loading";
  loadingElement.innerHTML = "<p>Carregando... Por favor, aguarde.</p>";
  result.innerHTML = "";
  result.appendChild(loadingElement);

  const gender = getSelectedValue("gender");
  const age = getInputNumberValue("age");
  const weight = getInputNumberValue("weight");
  const height = getInputNumberValue("height");
  const activitylevel = getSelectedValue("activity_level");
  const objective = getSelectedValue("training-objective");

  const tmb = Math.round(
    gender === "female"
      ? 655 + 9.6 * weight + 1.8 * height - 4.7 * age
      : 66 + 13.7 * weight + 5 * height - 6.8 * age
  );

  const maintenance = Math.round(tmb * activitylevel);
  const loseWeight = maintenance - 450;
  const gainWeight = maintenance + 450;

  const layout = ` `;

  result.innerHTML = layout;
  result.appendChild(loadingElement);

  try {
    const apiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Baseado nos dados do usuário monte uma rotina de treinos, com pelo menos 5 atividades físicas durante a semana, dando a opção de treinos de musculação e aeróbico durante os dias. Siga sempre um padrão nas mensagens, como por exemplo: Segunda-feira: [...], Terça-feira: [...], e assim por diante. Não seja proativo, não adicione nenhum texto adicional, apenas coloque o dia da semana e atividade, mas seja extremamente especifico com cada treino e os exercicios que seram feitos em cada dia. Quebre uma linha entre os dias. Devolva também um cronograma de dieta nos mesmo moldes do treino, baseado no objetivo do usuario e seus dados informados, quebre uma linha entre cada refeição. Adicione tambem a quantidade de agua que o usuario deve beber diariamente, Formate melhor os textos para que fique mais facil a leitura do  usuario. Nunca use markdown ou * quando for dar a resposta, devolva um texto limpo e de facil entendimento do usuario.",
            },
            {
              role: "user",
              content: `Objetivo: ${objective}, Metabolismo basal: ${tmb}, Sexo: ${gender}, Idade: ${age}, Peso: ${weight}, Altura: ${height},  Nível de atividade física: ${activitylevel} `,
            },
          ],
        }),
      }
    );

    const data = await apiResponse.json();
    const message = data.choices[0].message.content;

    loadingElement.remove();

    const aiResponseElement = document.createElement("div");
    aiResponseElement.innerHTML = `
      <h3 class='routine_title'>Sua rotina de treinos personalizada:</h3>
      <strong><pre class='chatgpt-response'>${message}</pre></strong>
        <ul>
    <li>
      Seu metabolismo basal é de <strong>${tmb} calorias</strong>.
    </li>
    <li>
      Para manter o seu peso você precisa consumir em média <strong>${maintenance} calorias</strong>.
    </li>
    <li>
      Para perder peso você precisa consumir em média <strong>${loseWeight} calorias</strong>.
    </li>
    <li>
      Para ganhar peso você precisa consumir em média <strong>${gainWeight} calorias</strong>.
    </li>
  </ul>
    `;
    result.appendChild(aiResponseElement);
  } catch (error) {

    loadingElement.remove();
    
    const errorElement = document.createElement("div");
    errorElement.innerHTML = "<p>Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.</p>";
    result.appendChild(errorElement);
  }
}

function getSelectedValue(id) {
  const select = document.getElementById(id);
  return select.options[select.selectedIndex].value;
}

function getInputNumberValue(id) {
  return Number(document.getElementById(id).value);
}
