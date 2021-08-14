import React, { useEffect, useRef, useState } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { createChart, CrosshairMode } from 'lightweight-charts';
import axios from 'axios'
import { templateSalesURL, templateDataURL } from './services/GenerateURL';
import './styles.css';

const ChartArea = () => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();
  const [timer, setTimer] = useState(0);
  const [apiResponse, setApiResponse] = useState([]);
  let areaSeries = useRef();
  const [itemInput, setItemInput] = useState('');
  const [templateID, setTemplateID] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState('');
  const [issuedSupply, setIssuedSupply] = useState('');
  const [lastSalePrice, setLastSalePrice] = useState('');
  const [marketCap, setMarketCap] = useState('');
  // const imgURLBase = "https://ipfs.atomichub.io/ipfs/";
  const imgURLBase = "https://resizer.atomichub.io/images/v1/preview?ipfs=";

  function handleSubmit(e) {
    e.preventDefault();
    const templateInput = e.target.elements[0].value;
    setTemplateID(templateInput)
  }

  function formatFloat(float, precision) {
    let formattedFloat;
    formattedFloat = new Intl.NumberFormat('en',{ 
      maximumFractionDigits: precision, 
      minimumFractionDigits: precision, 
    }).format(float)
    return formattedFloat
  }

  function getMinMax(arr) {
    let min = arr[0];
    let max = arr[0];
    let i = arr.length;
    while (i--) {
      min = arr[i] < min ? arr[i] : min;
      max = arr[i] > max ? arr[i] : max;
    }
    return { min, max };
  }

  useEffect(() => {
    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      handleScroll: true,
      handleScale: true,
      layout: {
        backgroundColor: '#253248',
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: '#334158',
          visible: false,
          labelVisible: false,
        },
        horzLines: {
          color: '#334158',
          visible: false,
          labelVisible: false,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      priceScale: {
        borderColor: '#485c7b',
        autoScale: true,
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    areaSeries.current = chart.current.addAreaSeries({});
  }, []);

  useEffect(() => {
      setTimeout(() =>{
          setTimer(prevstate => prevstate+1);
      }, 5000)
  }, [timer])

  useEffect(() => {
    const defaultTemplateID = 19553
    let apiSalesURL =''
    let apiTemplateURL =''
    if (templateID === ''){
      apiSalesURL = templateSalesURL(defaultTemplateID)
      apiTemplateURL = templateDataURL(defaultTemplateID)
    } else {
      apiSalesURL = templateSalesURL(parseInt(templateID))
      apiTemplateURL = templateDataURL(parseInt(templateID))
    }
    async function fetchData(){
     // GET last sales data for template + store last sale value to state
      axios.get(apiSalesURL)
        .then((response) => {
          if (JSON.stringify(response.data.data) !== JSON.stringify(apiResponse)){
            areaSeries.current.setData([])
            setApiResponse(response.data.data)
            let responseCount = response.data.data.length-1
            let lastSalePrice = response.data.data[responseCount].price / 100000000
            let allSalePrices = []
            setLastSalePrice(parseFloat(lastSalePrice).toFixed(2))
            response.data.data.forEach(function(sale) { 
              const formattedPrice = (sale.price / 100000000).toFixed(2);
              allSalePrices.push(parseFloat(formattedPrice))
              areaSeries.current.update(
                { time: sale.block_time/1000, value: formattedPrice },
              )
            });
            let minMax = getMinMax(allSalePrices)
            areaSeries.current.applyOptions({
              autoscaleInfoProvider: () => ({
                  priceRange: {
                      minValue: minMax.min,
                      maxValue: minMax.max,
                  },
              }),
            });
            // setTimeout(() => {
              chart.current.timeScale().fitContent();
            // }, 0);
          }
        })
        .catch(function (error){
        })
      // GET total supply data for template + store total supply value to state
      axios.get(apiTemplateURL)
        .then((response) => {
          setCollectionName(response.data.data[0].collection.name)
          // setTemplateName(response.data.data[0].template.immutable_data.name)
          setTemplateImage(imgURLBase+response.data.data[0].template.immutable_data.img+"&size=370")          
          setTemplateImage(imgURLBase+response.data.data[0].template.immutable_data.img)
          setIssuedSupply(response.data.data[0].template.issued_supply)
        })
        .catch(function (error){
          console.log(error)
        })
    };
    fetchData();
    console.log('fetched')
  }, [timer,templateID])

  useEffect(()=>{
    if(lastSalePrice === "" || issuedSupply === ""){
      return
    } else {
      // Calculate and format market cap 
      let marketCap = parseFloat(lastSalePrice*issuedSupply).toFixed(2)
      setMarketCap(marketCap)
    }
  }, [lastSalePrice, issuedSupply])

  // Resize chart on container resizes.
  useEffect(() => {
    resizeObserver.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.current.applyOptions({ width, height });
      setTimeout(() => {
        chart.current.timeScale().fitContent();
      }, 0);
    });
    resizeObserver.current.observe(chartContainerRef.current);
    return () => resizeObserver.current.disconnect();
  }, []);

  return (
    <>
    <div style={{paddingTop:15,paddingBottom:15, backgroundColor:"#253248", color:"white", }}>
      <Grid container align = "center" justifyContent = "center" alignItems = "center">
        <Grid item xs={12} sm={12} md={2} className="grid-item">
          <code>{collectionName}</code>          
          <h3>{templateName}</h3>
        </Grid>
        <Grid item xs={12} sm={12} md={1} className="grid-item">
          <img src={templateImage} alt={templateName} width="100px"/>
        </Grid>
        <Grid item xs={12} sm={4} md={2} className="grid-item">
          <code>Supply</code>
          <h3>{formatFloat(issuedSupply, 0)}</h3>
        </Grid>
        <Grid item xs={12} sm={4} md={2} className="grid-item">
          <code>Last Sale Price</code>
          <h3>{formatFloat(lastSalePrice, 2)} WAX</h3>
        </Grid>
        <Grid item xs={12} sm={4} md={2} className="grid-item">
          <code>Market Cap</code>
          <h3>{formatFloat(marketCap, 2)} WAX</h3> 
        </Grid>
        <Grid item xs={12} sm={12} md={3} className="grid-item">
          <form action="" onSubmit={handleSubmit}>
            <label htmlFor="">
              <input type="text" onChange={event => setItemInput(event.target.value)} value={itemInput} placeholder="Enter Template ID" name="" id="" style={{height: 31, width: 115, textAlign: 'center', borderRadius: '0px', border: 'none', borderTopLeftRadius:"2px",borderBottomLeftRadius:"2px"}} />
            </label>    
            <Button variant="contained" color="primary" type="submit" style={{borderRadius: "0px",backgroundColor: "#2b8660", fontSize:"12px",borderTopRightRadius:"2px",borderBottomRightRadius:"2px"}}>
              <code>Search</code>
            </Button>
          </form>
        </Grid>
      </Grid>
    </div>
    <div ref={chartContainerRef} className="chart-container" />
    </>
  );
}

export default ChartArea