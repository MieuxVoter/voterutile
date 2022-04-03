import {useState, useEffect} from 'react'
import Image from 'next/image'
import facebook from '../public/facebook.svg'
import twitter from '../public/twitter.svg'
import Title from '../components/Title'
import Counter from '../components/Counter'
import Footer from '../components/Footer'
import SingleChoice from '../components/SingleChoice'
import MajorityJugdment from '../components/MajorityJugdment'
import Done from '../components/Done'
import Form from '../components/Form'
import {candidates, grades} from '../lib/constants'
import {shuffleArray} from '../lib/utils'
import {personalData, connect} from '../lib/database'
import {storePersonalData, storeBallot} from '../lib/database'


export async function getStaticProps() {
  const endingDate = Date.parse(process.env.DATE_ENDING);
  const remain = endingDate - new Date()
  const remainDays = Math.max(0, parseInt(remain / 3600 / 24 / 1000));
  return {
    props: {
      remain: remainDays,
      goalParticipants: process.env.GOAL_PARTICIPANTS,
      numParticipants: process.env.NUM_PARTICIPANTS,
      numVotes: process.env.NUM_VOTES,
    }
  }
}

// <div className="left menu">
//   <Link className="ui ensavoirplus" href='/'>
//     <div className='ui button secondary'>
//       <i className="left arrow icon"></i> Accueil
//     </div></Link>
// </div>

const Head = (props) => (
  <div className='head'>


    <div className="ui container">

      <div className="ui top secondary menu">
        <div className="ui container">
          <div className="right menu">
            <a rel="noreferrer" target="_blank" href="https://www.facebook.com/mieuxvoter.fr" className='social'>
              <Image src={facebook} alt='facebook logo' />
            </a>
            <a rel="noreferrer" target="_blank" href="twitter.com/mieux_voter" className='social'>
              <Image src={twitter} alt='twitter logo' />
            </a>
            <div className='ui button secondary'>
              <a className="ui ensavoirplus" href='/faq'>Questions fréquentes</a>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div className="ui title">
      <Title />
      <h2 className='ui header subtitle'>Participez à l’expérience maintenant !</h2>

    </div>


  </div>
);

const Summary = (props) => {
  const numParticipantsK = parseInt(props.numParticipants / 1000);
  const numVotesK = parseInt(props.numVotes / 1000);

  return (
    <div id='summary' className='ui container summary'>
      <div className="ui two column grid">
        <div className="row">
          <div className='column'>
            <div className='left'>
              <h3 className='ui header'>Un système de vote pour révolutionner la démocratie</h3>
              <p>
                Exprimez enfin vos opinions sur tous les candidats et indiquons aux futurs décideurs ce que pensent vraiment les Français. Nous pouvons choisir différemment, nous devons changer le mode de scrutin !
              </p>
            </div>
          </div>
          <div className='column ballot'>
            <div className='right'>
              <Counter progress={props.numParticipants} total={props.goalParticipants} />
              <div className='stats'>
                <div className="ui two column grid">
                  <div className='column'>
                    <div className='redscore'>+{numParticipantsK}K</div>
                    <div className='legend'>votes</div>
                  </div>
                  <div className='column'>
                    <div className='redscore'>+{numVotesK}K</div>
                    <div className='legend'>participants</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
}


export default function Voter(props) {
  connect()
  const [stage, setStage] = useState(personalData && personalData.step);
  const ballotCandidates = [...candidates]
  shuffleArray(ballotCandidates)

  useEffect(() => {
    if (personalData && personalData.step) {
      setStage(personalData.step);
    }
  }, [personalData])

  const handleSubmit = (ballotOrPersonal) => {
    if (stage == 'info') {
      Object.keys(ballotOrPersonal).forEach(k => {personalData[k] = ballotOrPersonal[k]});
      storePersonalData(personalData)
      setStage('done')
    } else if (stage == 'mj') {
      personalData.step = personalData.sm ? 'info' : 'sm'
      storePersonalData(personalData)
      storeBallot(ballotOrPersonal, stage)
      setStage(personalData.step)
    } else if (stage == 'sm') {
      personalData.step = personalData.mj ? 'info' : 'mj'
      storePersonalData(personalData)
      storeBallot(ballotOrPersonal, stage)
      setStage(personalData.step)
    }
  }

  let Component = null
  if (stage == 'mj') {
    Component = MajorityJugdment
  }
  else if (stage == 'sm') {
    Component = SingleChoice
  }
  else if (stage == 'info') {
    Component = Form
  }
  else {
    Component = Done
  }

  return (
    <div className='ui voter'>
      <Head {...props} />
      <Summary {...props} />
      <Component {...props} onSubmit={handleSubmit} candidates={ballotCandidates} grades={grades} />
      <Footer />
    </div>
  )
}
