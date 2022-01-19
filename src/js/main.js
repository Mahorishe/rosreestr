$(function(){

  $('.menu__btn').on('click', function(){
    $('.menu').toggleClass('menu--active')
  });

  $('.slider__inner').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: false,
    prevArrow: '<button type="button" class="slick-prev"></button>',
    nextArrow: '<button type="button" class="slick-next"></button>',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 321,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      },
    ]
  });



})